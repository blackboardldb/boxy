import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const take = Math.min(
      parseInt(request.nextUrl.searchParams.get("take") || "10"),
      50 // tope de seguridad
    );
    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0");

    const { organizationId } = auth;
    // DESPUÉS — usa la fecha real en Santiago
    const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Santiago",
}).format(new Date());

    // SQL optimizado: evitamos casts redundantes (::date).
    // PostgreSQL puede hacer comparación de strings 'YYYY-MM-DD' de forma eficiente.
    const rows = await prisma.$queryRaw<
      { id: string; firstName: string; lastName: string; phone: string | null; membership: Prisma.JsonValue }[]
    >`
      SELECT id, "firstName", "lastName", phone, membership
      FROM public.users
      WHERE
        (role IS NULL OR role = 'user')
        AND membership IS NOT NULL
       AND "organizationId" = ${organizationId}
        AND membership->>'currentPeriodEnd' IS NOT NULL
        AND membership->>'currentPeriodEnd' >= ${today}
        AND (
          membership->>'status' IS NULL
          OR membership->>'status' NOT IN ('inactive', 'suspended', 'expired')
        )
      ORDER BY membership->>'currentPeriodEnd' ASC
      LIMIT ${take}
      OFFSET ${skip}
    `;

    const data = rows.map((u) => {
      const m = u.membership as any;
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        membershipType: m?.membershipType ?? null,
        currentPeriodEnd: m?.currentPeriodEnd ?? null,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/admin/members/expiring]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
