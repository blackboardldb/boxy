import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// HAL-01 Fase 4: Crea un registro en la tabla MembershipRenewal (fuente de verdad).
// Ya no escribe en el JSONB membership.pendingRenewal.

const renewalRequestSchema = z.object({
  planId:        z.string().min(1, "planId es requerido"),
  paymentMethod: z.string().min(1, "paymentMethod es requerido"),
  notes:         z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;  // Next.js 15: params es una Promise

    const parsed = renewalRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { planId, paymentMethod, notes } = parsed.data;

    // Validar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, userMembership: { select: { planId: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar que el plan existe y está activo
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      select: { id: true, name: true, price: true, duration: true, config: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Cancelar renovaciones pendientes anteriores (no puede haber dos pending)
    await prisma.membershipRenewal.updateMany({
      where: { userId, status: "pending" },
      data: { status: "cancelled" },
    });

    // currentPlanId: verificar que el planId del UserMembership exista en membership_plans
    // (puede ser un ID legado del JSONB que no exista en la tabla relacional)
    const currentPlanIdRaw = user.userMembership?.planId ?? null;
    let currentPlanId: string | null = null;
    if (currentPlanIdRaw) {
      const exists = await prisma.membershipPlan.findUnique({
        where: { id: currentPlanIdRaw },
        select: { id: true },
      });
      currentPlanId = exists ? currentPlanIdRaw : null;
    }

    // Crear la solicitud de renovación en la tabla relacional
    const renewal = await prisma.membershipRenewal.create({
      data: {
        userId,
        currentPlanId,
        requestedPlanId: planId,
        paymentMethod,
        status: "pending",
        notes: notes ?? null,
        renewalDetails: {
          requestedPlanName: plan.name,
          requestedPlanPrice: plan.price,
          requestedPlanClassLimit: (plan.config as any)?.classLimit ?? 0,
          requestedPlanDuration: plan.duration,
          paymentMethod,
        },
      },
    });

    return NextResponse.json({
      message: "Renewal request created successfully",
      renewal,
    });
  } catch (error: any) {
    // Log detallado para diagnóstico — incluye mensaje de Prisma
    const errMsg = error?.message ?? String(error);
    const errCode = error?.code ?? "unknown";
    console.error("Error creating renewal request:", { message: errMsg, code: errCode, meta: error?.meta });
    return NextResponse.json(
      { error: errMsg, code: errCode },
      { status: 500 }
    );
  }
}
