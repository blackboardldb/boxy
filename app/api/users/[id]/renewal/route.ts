import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
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

    const parsed = renewalRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { planId, paymentMethod, notes, autoApprove, planName, planPrice, planClassLimit, planDuration, startDate, paymentDate } = parsed.data;

    // Si autoApprove, requerir autenticación de admin antes de continuar
    // Guardamos la referencia al auth para usar organizationId como fallback si el alumno
    // aún no tiene memberships registradas (race condition en flujo de creación).
    let adminOrgId: string | null = null;
    if (autoApprove) {
      const auth = await requireAdmin();
      if ("error" in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }
      adminOrgId = auth.organizationId;
    }

    // Validar que el usuario existe (incluir membresía para consolidar período anterior en autoApprove)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        memberships: {
          select: { organizationId: true },
          take: 1,
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

    // Verificar que el plan existe
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      select: { id: true, name: true, price: true, duration: true, config: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Construir startDate como medianoche UTC para que la comparación con la DB
    // sea exacta sin importar la zona horaria del servidor (desarrollo UTC-4 vs Vercel UTC+0).
    const startDateNormalized = toMidnightUTC(startDate ?? null);

    // Usar paymentDate para processedAt si viene (manual admin)
    let processedAtDate: Date = autoApprove ? new Date() : new Date();
    if (autoApprove && paymentDate) {
      processedAtDate = toMidnightUTC(paymentDate) ?? new Date();
    }

    // organizationId: preferir la de memberships del usuario, pero usar
    // adminOrgId como fallback seguro para el caso de alumno recién creado
    // que aún no tiene OrganizationMember commiteado (race condition).
    const orgId = user.memberships?.[0]?.organizationId ?? adminOrgId ?? null;

    // Cancelar renovaciones pendientes anteriores (no puede haber dos pending)
    await prisma.membershipRenewal.updateMany({
      where: { userId, status: { in: ["pending", "scheduled"] } },
      data: { status: "cancelled" },
    });

    // currentPlanId: verificar que el planId del UserMembership exista en membership_plans
    const currentPlanIdRaw = user.userMembership?.planId ?? null;
    let currentPlanId: string | null = null;
    if (currentPlanIdRaw) {
      const exists = await prisma.membershipPlan.findUnique({
        where: { id: currentPlanIdRaw },
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
      // Buscar renewal existente por clave de negocio (userId, organizationId, startDate)
      const existingApproved = await prisma.membershipRenewal.findFirst({
        where: {
          userId,
          organizationId: orgId,
          status: { in: ['approved', 'superseded'] },
          startDate: startDateNormalized,
        },
      });

      if (existingApproved) {
        // Existe → actualizar. Nunca acumular un registro nuevo.
        renewal = await prisma.membershipRenewal.update({
          where: { id: existingApproved.id },
          data: renewalData,
        });
        console.log(`[renewal POST autoApprove] Renewal updated for user ${userId}, orgId ${orgId}`);
      } else {
        renewal = await prisma.membershipRenewal.create({
          data: { userId, ...renewalData },
        });
        console.log(`[renewal POST autoApprove] Renewal created for user ${userId}, orgId ${orgId}`);
      }

      // IMPORTANTE: Al aprobar automáticamente, también debemos activar la UserMembership del usuario!
      const startDateStr = startDate ?? new Date().toISOString().split("T")[0];
      const periodEndStr = calcularFechaTerminoMembresia(startDateStr, effectiveDuration || 1);
      const periodEnd = toMidnightUTC(periodEndStr);
      const planConfig = plan.config as any;

      await prisma.userMembership.upsert({
        where: { userId },
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
    } else {
      // Flujo sin autoApprove (alumno solicita renovación) → siempre crear
      renewal = await prisma.membershipRenewal.create({
        data: { userId, ...renewalData },
      });
    }

    // Consolidar período anterior en user_monthly_stats cuando el admin asigna un nuevo plan directamente.
    // Fire-and-forget: no bloquea la respuesta ni falla la operación si hay error.
    if (autoApprove && user.userMembership?.currentPeriodStart && user.userMembership?.currentPeriodEnd) {
      const prevPeriodStart = toMidnightUTC(
        user.userMembership.currentPeriodStart.toISOString().split("T")[0]
      )!;
      const prevPeriodEnd   = user.userMembership.currentPeriodEnd;
      const prevPlanName    = user.userMembership.membershipType ?? "Plan";
      const prevClassLimit  = user.userMembership.classLimit ?? 0;
      const orgId           = user.memberships?.[0]?.organizationId;
      if (!orgId) throw new Error("organizationId is required");

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
    const errMsg  = error instanceof Error ? error.message : String(error);
    const errCode = (error as { code?: string })?.code ?? "unknown";
    console.error("Error creating renewal request:", { message: errMsg, code: errCode });
    return NextResponse.json({ error: errMsg, code: errCode }, { status: 500 });
  }
}
