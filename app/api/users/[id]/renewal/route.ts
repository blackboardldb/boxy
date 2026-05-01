import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { z } from "zod";

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
    if (autoApprove) {
      const auth = await requireAdmin();
      if ("error" in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }
    }

    // Validar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true, userMembership: { select: { planId: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar que el plan existe
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      select: { id: true, name: true, price: true, duration: true, config: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Construir startDate como Date local si viene en el payload
    let startDateAsDate: Date | null = null;
    if (startDate) {
      const [y, m, d] = startDate.split("-").map(Number);
      startDateAsDate = new Date(y, m - 1, d); // medianoche local, no UTC
    }

    // Usar paymentDate para processedAt si viene (manual admin)
    let processedAtDate: Date | null = autoApprove ? new Date() : null;
    if (autoApprove && paymentDate) {
      const [py, pm, pd] = paymentDate.split("-").map(Number);
      processedAtDate = new Date(py, pm - 1, pd);
    }

    // Cancelar renovaciones pendientes anteriores (no puede haber dos pending)
    await prisma.membershipRenewal.updateMany({
      where: { userId, status: "pending" },
      data: { status: "cancelled" },
    });

    // Si hay startDate y autoApprove, cancelar approved previos del mismo periodo
    // para que el nuevo reemplace sin acumular
    if (startDateAsDate && autoApprove) {
      await prisma.membershipRenewal.updateMany({
        where: {
          userId,
          status: "approved",
          startDate: startDateAsDate,
        },
        data: {
          status: "cancelled",
          notes: "Reemplazado por renovación posterior del administrador",
        },
      });
    }

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

    // Crear el registro de renovación
    const renewal = await prisma.membershipRenewal.create({
      data: {
        userId,
        currentPlanId,
        requestedPlanId: planId,
        paymentMethod,
        status:      autoApprove ? "approved" : "pending",
        processedAt: processedAtDate,
        startDate:   startDateAsDate,
        // Solo registrar monto y organizationId si es una transacción real (autoApprove + precio > 0)
        amount:         autoApprove && effectivePrice > 0 ? effectivePrice : null,
        organizationId: autoApprove ? user.organizationId : null,
        notes: notes ?? null,
        renewalDetails: {
          requestedPlanName:       effectiveName,
          requestedPlanPrice:      effectivePrice,
          requestedPlanClassLimit: effectiveClassLimit,
          requestedPlanDuration:   effectiveDuration,
          paymentMethod,
          startDate: startDate ?? null,
        },
      },
    });

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
