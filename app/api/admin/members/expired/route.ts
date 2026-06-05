import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

// HAL-01 Fase 4 Sprint 2.2: Migrado de $queryRaw JSONB a query Prisma sobre UserMembership.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const take = Math.min(
      parseInt(request.nextUrl.searchParams.get("take") || "10"),
      50
    );
    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0");

    const { organizationId: authOrgId } = auth;
    const organizationId = request.headers.get("x-organization-id") || authOrgId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ANTES: $queryRaw con membership->>'currentPeriodEnd' < today
    // AHORA: query relacional sobre UserMembership
    const memberships = await prisma.userMembership.findMany({
      where: {
        organizationId,
        currentPeriodEnd: { lt: today },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { currentPeriodEnd: "desc" },
      take,
      skip,
    });

    const data = memberships.map((um) => ({
      id: um.user.id,
      firstName: um.user.firstName,
      lastName: um.user.lastName,
      phone: um.user.phone,
      membershipType: um.membershipType,
      currentPeriodEnd: um.currentPeriodEnd
        ? um.currentPeriodEnd.toISOString().split("T")[0]
        : null,
    }));

    const response = NextResponse.json({ success: true, data });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=120"
    );
    return response;
  } catch (error) {
    console.error("[GET /api/admin/members/expired]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
