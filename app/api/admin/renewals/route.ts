import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

// GET /api/admin/renewals?status=pending
// Devuelve las renovaciones de membresía con info del usuario y plan solicitado.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { organizationId: authOrgId } = auth;
    const organizationId = request.headers.get("x-organization-id") || authOrgId;
    const status = request.nextUrl.searchParams.get("status") || "pending";
    const take = Math.min(
      parseInt(request.nextUrl.searchParams.get("take") || "50"),
      100
    );

    const renewals = await prisma.membershipRenewal.findMany({
      where: {
        status,
        user: { memberships: { some: { organizationId } } },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            userMembership: {
              select: {
                status: true,
                membershipType: true,
                currentPeriodEnd: true,
                planId: true,
              },
            },
          },
        },
      },
      orderBy: { requestedAt: "asc" },
      take,
    });

    // Enriquecer con info del plan solicitado
    const planIds = [
      ...new Set(renewals.map((r) => r.requestedPlanId).filter(Boolean) as string[]),
    ];
    const plans =
      planIds.length > 0
        ? await prisma.membershipPlan.findMany({
            where: { id: { in: planIds } },
            select: { id: true, name: true, price: true, duration: true, config: true },
          })
        : [];
    const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));

    const data = renewals.map((r) => {
      const plan = r.requestedPlanId ? planMap[r.requestedPlanId] : null;
      const details = r.renewalDetails as { requestedPlanName?: string; requestedPlanPrice?: number; requestedPlanClassLimit?: number; requestedPlanDuration?: number; } | null;
      const currentPeriodEnd = r.user.userMembership?.currentPeriodEnd;
      const daysUntilExpiration = currentPeriodEnd
        ? Math.ceil(
            (new Date(currentPeriodEnd).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      return {
        id: r.id,
        status: r.status,
        requestedAt: r.requestedAt,
        paymentMethod: r.paymentMethod,
        notes: r.notes,
        user: {
          id: r.user.id,
          firstName: r.user.firstName,
          lastName: r.user.lastName,
          email: r.user.email,
          phone: r.user.phone,
          membership: r.user.userMembership,
          daysUntilExpiration,
        },
        requestedPlan: plan
          ? {
              id: plan.id,
              name: plan.name,
              price: plan.price,
              classLimit: (plan.config as { classLimit?: number })?.classLimit ?? 0,
              durationInMonths: plan.duration,
            }
          : {
              id: r.requestedPlanId,
              name: details?.requestedPlanName ?? null,
              price: details?.requestedPlanPrice ?? null,
              classLimit: details?.requestedPlanClassLimit ?? null,
              durationInMonths: details?.requestedPlanDuration ?? null,
            },
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/renewals]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
