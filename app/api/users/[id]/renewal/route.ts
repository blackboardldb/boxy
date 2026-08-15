import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFast } from "@/lib/supabase/auth-guard";
import { resolveInternalUser } from "@/lib/services/resolve-internal-user";
import { z } from "zod";
import { toMidnightUTC } from "@/lib/utils/dates";
import { calcularFechaTerminoMembresia } from "@/lib/utils";

// HAL-01 Fase 4: Crea un registro en la tabla MembershipRenewal (fuente de verdad).
// Ya no escribe en el JSONB membership.pendingRenewal.
// Extensión: soporta `autoApprove: true` para registros directos del admin (sin flujo pending → approved).

const renewalRequestSchema = z.object({
  planId:         z.string().min(1, "planId es requerido"),
  paymentMethod:  z.string().min(1, "paymentMethod es requerido"),
  notes:          z.string().optional(),
  // Campos opcionales para el modo autoApprove (admin asigna plan directo)
  autoApprove:    z.boolean().optional().default(false),
  planName:       z.string().optional(),
  planPrice:      z.number().optional(),
  planClassLimit: z.number().optional(),
  planDuration:   z.number().optional(),
  startDate:      z.string().optional(),
  paymentDate:    z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // BUG-04: guard ausente en flujo sin autoApprove — cualquier actor podía crear
    // renovaciones a nombre de otro alumno.
    // Se sube requireAuth() al inicio, independientemente del flag autoApprove.
    // Si es admin: puede operar sobre cualquier userId.
    // Si es alumno: solo puede crear renovaciones para su propio userId de sesión.
    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const activeOrgId = auth.organizationId;

    const internalUser = await resolveInternalUser(auth);
    if (!internalUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const isAdmin = ["ADMIN", "COACH"].includes(auth.role);

    const parsed = renewalRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { planId, paymentMethod, notes, autoApprove, planName, planPrice, planClassLimit, planDuration, startDate, paymentDate } = parsed.data;

    // Si autoApprove, verificar que el solicitante sea admin
    if (autoApprove && !isAdmin) {
      return NextResponse.json(
        { error: "Solo un administrador puede usar autoApprove" },
        { status: 403 }
      );
    }

    // Si es alumno solicitando para sí mismo, validar identidad
    if (!isAdmin && internalUser.id !== userId) {
      return NextResponse.json(
        { error: "Solo puedes solicitar renovaciones para tu propia cuenta" },
        { status: 403 }
      );
    }

    // Guardamos la referencia al auth para usar organizationId como fallback si el alumno
    // aún no tiene memberships registradas (race condition en flujo de creación).
    let adminOrgId: string | null = null;
    if (autoApprove) {
      adminOrgId = activeOrgId;
    }

    // Validar que el usuario existe (incluir membresía para consolidar período anterior en autoApprove)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        memberships: {
          select: { organizationId: true },
        },
        userMembership: {
          select: {
            planId: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            membershipType: true,
            classLimit: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 } );
    }

    // Guard cross-tenant (solo aplica a admins, que pueden especificar userId arbitrario).
    // Rama permisiva: si memberships está vacío, es la race condition del alta de alumno
    // nuevo (POST /api/users crea User+OrganizationMember atómicamente, pero el cliente
    // puede llamar a este endpoint en el mismo instante). Se permite continuar usando
    // adminOrgId como fallback — el flujo lo resuelve en L125.
    // Si ya tiene memberships pero ninguna en el centro del admin → cruce de tenant real → 404.
    if (isAdmin && user.memberships.length > 0) {
      const belongsToOrg = user.memberships.some((m) => m.organizationId === activeOrgId);
      if (!belongsToOrg) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Verificar que el plan existe Y pertenece al centro del tenant activo.
    // findFirst con organizationId cierra el vector de cross-tenant plan injection:
    // un alumno del Centro A no puede usar un planId del Centro B para congelar
    // un precio distinto en la solicitud de renovación.
    const plan = await prisma.membershipPlan.findFirst({
      where: { id: planId, organizationId: activeOrgId },
      select: { id: true, name: true, price: true, duration: true, config: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 } );
    }

    // Construir startDate como medianoche UTC para que la comparación con la DB
    // sea exacta sin importar la zona horaria del servidor (desarrollo UTC-4 vs Vercel UTC+0).
    const startDateNormalized = toMidnightUTC(startDate ?? null);

    // Usar paymentDate para processedAt si viene (manual admin)
    let processedAtDate: Date = autoApprove ? new Date() : new Date();
    if (autoApprove && paymentDate) {
      processedAtDate = toMidnightUTC(paymentDate) ?? new Date();
    }

    // MT-01: Filtrar por organizationId del tenant activo, no del JWT primario.
    // Anteriormente se usaba auth.organizationId creyendo erróneamente que era
    // la fuente de verdad, causando fugas de datos en alumnos/admins bicentrados.
    const orgId = activeOrgId;

    // Cancelar renovaciones pendientes anteriores (no puede haber dos pending)
    // Se ejecuta transaccionalmente más abajo para ambos flujos (autoApprove y alumno)
    // para evitar condición de carrera (Hallazgo 4).

    // currentPlanId: verificar que el planId del UserMembership exista en membership_plans
    const currentPlanIdRaw = user.userMembership?.[0]?.planId ?? null;
    let currentPlanId: string | null = null;
    if (currentPlanIdRaw) {
      const exists = await prisma.membershipPlan.findFirst({
        where: { id: currentPlanIdRaw, organizationId: activeOrgId },
        select: { id: true },
      });
      currentPlanId = exists ? currentPlanIdRaw : null;
    }

    // Determinar los valores efectivos (el admin puede sobreescribir precio y clases)
    const effectivePrice      = planPrice      ?? plan.price;
    const effectiveClassLimit = planClassLimit ?? (plan.config as { classLimit?: number })?.classLimit ?? 0;
    const effectiveDuration   = planDuration   ?? plan.duration;
    const effectiveName       = planName       ?? plan.name;

    // ── Lógica de upsert en autoApprove ────────────────────────────────────────────
    // REGLA DE NEGOCIO: si ya existe un renewal aprobado para este
    // (userId, organizationId, startDate), actualizarlo en lugar de crear uno nuevo.
    // Solo se crea cuando no existe ninguno para ese período + centro.
    const renewalData = {
      currentPlanId,
      requestedPlanId: planId,
      paymentMethod,
      status:      autoApprove ? "approved" : "pending",
      processedAt: processedAtDate,
      startDate:   startDateNormalized,
      amount:         autoApprove && effectivePrice > 0 ? effectivePrice : null,
      // MT-05: organizationId es NOT NULL en la BD — usar orgId o cadena vacía como fallback
      organizationId: orgId ?? "",
      notes: notes ?? null,
      renewalDetails: {
        requestedPlanName:       effectiveName,
        requestedPlanPrice:      effectivePrice,
        requestedPlanClassLimit: effectiveClassLimit,
        requestedPlanDuration:   effectiveDuration,
        paymentMethod,
        startDate: startDate ?? null,
      },
    };

    let renewal;
    if (autoApprove && startDateNormalized && orgId) {
      renewal = await prisma.$transaction(async (tx) => {
        // 1. Cancelar renovaciones pendientes anteriores de forma transaccional
        await tx.membershipRenewal.updateMany({
          where: { userId, organizationId: orgId, status: { in: ["pending", "scheduled"] } },
          data: { status: "cancelled" },
        });

        // 2. Buscar renewal existente por clave de negocio (userId, organizationId, startDate)
        const existingApproved = await tx.membershipRenewal.findFirst({
          where: {
            userId,
            organizationId: orgId,
            status: { in: ['approved', 'superseded'] },
            startDate: startDateNormalized,
          },
        });

        let localRenewal;
        if (existingApproved) {
          // Existe → actualizar. Nunca acumular un registro nuevo.
          localRenewal = await tx.membershipRenewal.update({
            where: { id: existingApproved.id },
            data: renewalData,
          });
          console.log(`[renewal POST autoApprove] Renewal updated for user ${userId}, orgId ${orgId}`);
        } else {
          localRenewal = await tx.membershipRenewal.create({
            data: { userId, ...renewalData },
          });
          console.log(`[renewal POST autoApprove] Renewal created for user ${userId}, orgId ${orgId}`);
        }

        // 3. Activar la UserMembership del usuario de forma atómica
        const startDateStr = startDate ?? new Date().toISOString().split("T")[0];
        const periodEndStr = calcularFechaTerminoMembresia(startDateStr, effectiveDuration || 1);
        const periodEnd = toMidnightUTC(periodEndStr);
        const planConfig = plan.config as any;

        await tx.userMembership.upsert({
          where: { userId_organizationId: { userId, organizationId: orgId } },
          update: {
            status: "active",
            planId: planId,
            membershipType: effectiveName,
            monthlyPrice: effectivePrice,
            currentPeriodStart: startDateNormalized,
            currentPeriodEnd: periodEnd,
            classLimit: effectiveClassLimit,
            ...(planConfig?.disciplineAccess ? { disciplineAccess: planConfig.disciplineAccess } : {}),
            ...(planConfig?.allowedDisciplines ? { allowedDisciplines: planConfig.allowedDisciplines } : {}),
            ...(typeof planConfig?.canFreeze === "boolean" ? { canFreeze: planConfig.canFreeze } : {}),
            ...(typeof planConfig?.freezeDurationDays === "number" ? { freezeDurationDays: planConfig.freezeDurationDays } : {}),
            ...(typeof planConfig?.autoRenews === "boolean" ? { autoRenews: planConfig.autoRenews } : {}),
            ...(typeof planConfig?.allowCancellation === "boolean" ? { allowCancellation: planConfig.allowCancellation } : {}),
            ...(typeof planConfig?.cancellationHours === "number" ? { cancellationHours: planConfig.cancellationHours } : {}),
            ...(typeof planConfig?.maxBookingsPerDay === "number" ? { maxBookingsPerDay: planConfig.maxBookingsPerDay } : {}),
            ...(typeof planConfig?.autoWaitlist === "boolean" ? { autoWaitlist: planConfig.autoWaitlist } : {}),
          },
          create: {
            userId,
            organizationId: orgId,
            status: "active",
            planId: planId,
            membershipType: effectiveName,
            monthlyPrice: effectivePrice,
            currentPeriodStart: startDateNormalized,
            currentPeriodEnd: periodEnd,
            classLimit: effectiveClassLimit,
            ...(planConfig?.disciplineAccess ? { disciplineAccess: planConfig.disciplineAccess } : {}),
            ...(planConfig?.allowedDisciplines ? { allowedDisciplines: planConfig.allowedDisciplines } : {}),
            ...(typeof planConfig?.canFreeze === "boolean" ? { canFreeze: planConfig.canFreeze } : {}),
            ...(typeof planConfig?.freezeDurationDays === "number" ? { freezeDurationDays: planConfig.freezeDurationDays } : {}),
            ...(typeof planConfig?.autoRenews === "boolean" ? { autoRenews: planConfig.autoRenews } : {}),
            ...(typeof planConfig?.allowCancellation === "boolean" ? { allowCancellation: planConfig.allowCancellation } : {}),
            ...(typeof planConfig?.cancellationHours === "number" ? { cancellationHours: planConfig.cancellationHours } : {}),
            ...(typeof planConfig?.maxBookingsPerDay === "number" ? { maxBookingsPerDay: planConfig.maxBookingsPerDay } : {}),
            ...(typeof planConfig?.autoWaitlist === "boolean" ? { autoWaitlist: planConfig.autoWaitlist } : {}),
          },
        });

        return localRenewal;
      });
    } else {
      // Flujo sin autoApprove (alumno solicita renovación) → siempre crear, de forma transaccional
      await prisma.$transaction(async (tx) => {
        await tx.membershipRenewal.updateMany({
          where: { userId, organizationId: activeOrgId, status: { in: ["pending", "scheduled"] } },
          data: { status: "cancelled" },
        });

        renewal = await tx.membershipRenewal.create({
          data: { userId, ...renewalData },
        });
      });
    }

    // Consolidar período anterior en user_monthly_stats cuando el admin asigna un nuevo plan directamente.
    // Fire-and-forget: no bloquea la respuesta ni falla la operación si hay error.
    if (autoApprove && user.userMembership?.[0]?.currentPeriodStart && user.userMembership?.[0]?.currentPeriodEnd) {
      const prevPeriodStart = toMidnightUTC(
        user.userMembership[0].currentPeriodStart.toISOString().split("T")[0]
      )!;
      const prevPeriodEnd   = user.userMembership[0].currentPeriodEnd;
      const prevPlanName    = user.userMembership[0].membershipType ?? "Plan";
      const prevClassLimit  = user.userMembership[0].classLimit ?? 0;

      prisma.classRegistration.count({
        where: {
          userId,
          status: "registered",
          class: { dateTime: { gte: prevPeriodStart, lte: prevPeriodEnd } },
        },
      }).then((classesAttended) =>
        prisma.userMonthlyStat.upsert({
          where: { userId_periodStart: { userId, periodStart: prevPeriodStart } },
          create: {
            id: `stat_${Date.now()}_${userId.slice(-6)}`,
            userId,
            organizationId: orgId,
            periodStart: prevPeriodStart,
            periodEnd: prevPeriodEnd,
            classesAttended,
            classesLimit: prevClassLimit,
            planName: prevPlanName,
          },
          update: {
            periodEnd: prevPeriodEnd,
            classesAttended,
            classesLimit: prevClassLimit,
            planName: prevPlanName,
          },
        })
      ).catch((err) => {
        console.warn("[renewal POST autoApprove] No se pudo consolidar user_monthly_stats:", err.message);
      });
    }

    return NextResponse.json({
      success: true,
      message: autoApprove ? "Ingreso registrado correctamente" : "Renewal request created successfully",
      renewal,
    });
  } catch (error: unknown) {
    const errCode = (error as { code?: string })?.code;
    
    // Captura específica del Partial Unique Index (violación de concurrencia P2002)
    if (errCode === 'P2002') {
      return NextResponse.json(
        { error: "Ya existe una solicitud o renovación activa para esta fecha." },
        { status: 409 }
      );
    }

    const errMsg  = error instanceof Error ? error.message : String(error);
    console.error("Error creating renewal request:", { message: errMsg, code: errCode ?? "unknown" });
    return NextResponse.json({ error: errMsg, code: errCode ?? "unknown" }, { status: 500 });
  }
}
