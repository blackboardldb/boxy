import { NextRequest, NextResponse } from "next/server";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { getTodayInTimezone } from "@/lib/utils/dates";

// HAL-01 Fase 4 Sprint 2.1: Migrado de $queryRaw JSONB a query Prisma sobre UserMembership.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const take = Math.min(
      parseInt(request.nextUrl.searchParams.get("take") || "10"),
      50
    );
    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0");

    const { organizationId } = auth;

    // Leer timezone de la org para anclar "hoy" al calendario local del centro,
    // no al UTC del servidor (que diferiría 3-4h en Vercel → corte erróneo de medianoche).
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { timezone: true },
    });
    const today = getTodayInTimezone(org?.timezone ?? "America/Santiago");

    // ANTES: $queryRaw con membership->>'currentPeriodEnd' >= today
    // AHORA: query relacional sobre UserMembership
    const memberships = await prisma.userMembership.findMany({
      where: {
        organizationId,
        currentPeriodEnd: { gte: today },
        status: { notIn: ["inactive", "suspended", "expired"] },
        user: { is: { deletedAt: null } },
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
      orderBy: { currentPeriodEnd: "asc" },
      take,
      skip,
    });

    const data = memberships
      .filter((um) => um.user !== null)
      .map((um) => ({
        id: um.user!.id,
        firstName: um.user!.firstName,
        lastName: um.user!.lastName,
        phone: um.user!.phone,
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
    console.error("[GET /api/admin/members/expiring]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
