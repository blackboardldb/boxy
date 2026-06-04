import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { z } from "zod";

// HAL-01 Fase 4 Sprint 1.3 (revisado): Aprueba una renovación pendiente.
// Actualiza tanto la tabla UserMembership (plan + status + fechas) como
// la tabla MembershipRenewal (status → approved).
// Ya no lee ni escribe en el JSONB membership.

const approveRenewalSchema = z.object({
  startDate: z.string().min(1).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;  // Next.js 15: params es una Promise

    const parsed = approveRenewalSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // startDate: la fecha de inicio del nuevo período (la envía el admin desde el modal)
    const startDate: string | undefined = parsed.data?.startDate;

    // 1. Verificar que el usuario existe y tiene una UserMembership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userMembership: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // 2. Buscar la renovación pendiente más reciente
    const pendingRenewal = await prisma.membershipRenewal.findFirst({
      where: { userId, status: "pending" },
      orderBy: { requestedAt: "desc" },
    });

    if (!pendingRenewal) {
      return NextResponse.json(
        { error: "No hay renovación pendiente para este usuario" },
        { status: 400 }
      );
    }

    // 3. Obtener información del plan solicitado
    let planData: {
      id: string;
      name: string | null;
      price: number | null;
      classLimit: number;
      durationInMonths: number;
      disciplineAccess?: string;
      allowedDisciplines?: string[];
      canFreeze?: boolean;
      freezeDurationDays?: number;
      autoRenews?: boolean;
      allowCancellation?: boolean;
      cancellationHours?: number;
      maxBookingsPerDay?: number;
      autoWaitlist?: boolean;
    } | null = null;

    if (pendingRenewal.requestedPlanId) {
      // MembershipPlan usa `duration` (no `durationInMonths`) y classLimit vive en config JSON
      const raw = await prisma.membershipPlan.findUnique({
        where: { id: pendingRenewal.requestedPlanId },
        select: { id: true, name: true, price: true, duration: true, config: true },
      });
      if (raw) {
        planData = {
          id: raw.id,
          name: raw.name,
          price: raw.price,
          classLimit: (raw.config as { classLimit?: number })?.classLimit ?? 0,
          durationInMonths: raw.duration,
        };
      }
    }

    if (!planData) {
      // Fallback: usar los detalles guardados en renewalDetails
      const details = pendingRenewal.renewalDetails as { requestedPlanName?: string; requestedPlanPrice?: number; requestedPlanClassLimit?: number; requestedPlanDuration?: number; } | null;
      planData = {
        id: pendingRenewal.requestedPlanId ?? "",
        name: details?.requestedPlanName ?? null,
        price: details?.requestedPlanPrice ?? null,
        classLimit: details?.requestedPlanClassLimit ?? 0,
        durationInMonths: details?.requestedPlanDuration ?? 1,
      };
    }

    // 4. Calcular fechas del nuevo período
    const now = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santiago",
    }).format(new Date());

    const periodStart = startDate || now;

    // Calcular fecha fin basada en durationInMonths
    const startDateObj = new Date(periodStart + "T00:00:00");
    const endDateObj = new Date(startDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + (planData.durationInMonths || 1));
    // Restar 1 día para que sea el último día del período
    endDateObj.setDate(endDateObj.getDate() - 1);
    const periodEnd = endDateObj.toISOString().split("T")[0];

    // 5. Actualizar UserMembership con el nuevo plan (en transacción)
    const [updatedMembership] = await prisma.$transaction([
      // 5a. Actualizar la membresía del usuario
      prisma.userMembership.upsert({
        where: { userId },
        update: {
          status: "active",
          planId: planData.id || null,
          membershipType: planData.name,
          monthlyPrice: planData.price,
          currentPeriodStart: new Date(periodStart + "T00:00:00"),
          currentPeriodEnd: new Date(periodEnd + "T23:59:59"),
          classLimit: planData.classLimit ? planData.classLimit * (planData.durationInMonths || 1) : 0,
          ...(planData.disciplineAccess ? { disciplineAccess: planData.disciplineAccess } : {}),
          ...(planData.allowedDisciplines ? { allowedDisciplines: planData.allowedDisciplines } : {}),
          ...(typeof planData.canFreeze === "boolean" ? { canFreeze: planData.canFreeze } : {}),
          ...(typeof planData.freezeDurationDays === "number" ? { freezeDurationDays: planData.freezeDurationDays } : {}),
          ...(typeof planData.autoRenews === "boolean" ? { autoRenews: planData.autoRenews } : {}),
          ...(typeof planData.allowCancellation === "boolean" ? { allowCancellation: planData.allowCancellation } : {}),
          ...(typeof planData.cancellationHours === "number" ? { cancellationHours: planData.cancellationHours } : {}),
          ...(typeof planData.maxBookingsPerDay === "number" ? { maxBookingsPerDay: planData.maxBookingsPerDay } : {}),
          ...(typeof planData.autoWaitlist === "boolean" ? { autoWaitlist: planData.autoWaitlist } : {}),
        },
        create: {
          userId,
          organizationId: user.organizationId ?? "org_blacksheep_001",
          status: "active",
          planId: planData.id || null,
          membershipType: planData.name,
          monthlyPrice: planData.price,
          currentPeriodStart: new Date(periodStart + "T00:00:00"),
          currentPeriodEnd: new Date(periodEnd + "T23:59:59"),
          classLimit: planData.classLimit ? planData.classLimit * (planData.durationInMonths || 1) : 0,
        },
      }),
      // 5b. Marcar la renovación como aprobada
      prisma.membershipRenewal.update({
        where: { id: pendingRenewal.id },
        data: {
          status: "approved",
          processedAt: new Date(),
          amount: planData.price, // ← monto guardado para historial
          organizationId: user.organizationId, // ← denormalización para RLS e índices
          notes: `Aprobado. Período: ${periodStart} → ${periodEnd}`,
          startDate: new Date(periodStart + "T00:00:00"), // ← fix: necesario para historial y periodsCompleted
          renewalDetails: {
            // Preservar datos originales de la solicitud
            ...((pendingRenewal.renewalDetails as object) ?? {}),
            // Agregar fechas calculadas y datos del plan aprobado
            startDate: periodStart,
            endDate: periodEnd,
            requestedPlanName: planData.name,
            requestedPlanPrice: planData.price,
            requestedPlanDuration: planData.durationInMonths,
            requestedPlanClassLimit: planData.classLimit,
          },
        },
      }),
    ]);

    // 5c. Consolidar el período anterior en user_monthly_stats (fire-and-forget)
    // Se ejecuta fuera de la transacción para no bloquearla. Si falla, no afecta la aprobación.
    const prevMembership = user.userMembership;
    if (prevMembership?.currentPeriodStart && prevMembership?.currentPeriodEnd) {
      const prevPeriodStart = prevMembership.currentPeriodStart;
      const prevPeriodEnd   = prevMembership.currentPeriodEnd;
      const prevPlanName    = prevMembership.membershipType ?? "Plan";
      const prevClassLimit  = prevMembership.classLimit ?? 0;
      const orgId           = user.organizationId ?? "org_blacksheep_001";

      // Contar clases reales del período anterior
      prisma.classRegistration.count({
        where: {
          userId,
          status: "registered",
          class: {
            dateTime: {
              gte: prevPeriodStart,
              lte: prevPeriodEnd,
            },
          },
        },
      }).then((classesAttended) => {
        return prisma.userMonthlyStat.upsert({
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
        });
      }).catch((err) => {
        console.warn("[renewal/approve] No se pudo consolidar user_monthly_stats:", err.message);
      });
    }



    // 6. Emitir evento WebSocket
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    try {
      await fetch(`${baseUrl}/api/emit-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: `org_${user.organizationId}`,
          event: "membership-status-changed",
          data: {
            userId,
            newStatus: "active",
            planName: planData.name,
            periodEnd,
          },
        }),
      });
    } catch (wsError) {
      console.warn("[renewal/approve] WebSocket event failed:", wsError);
    }

    return NextResponse.json({
      message: "Usuario aprobado exitosamente",
      membership: updatedMembership,
      periodStart,
      periodEnd,
    });
  } catch (error: any) {
    console.error("Error al aprobar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
