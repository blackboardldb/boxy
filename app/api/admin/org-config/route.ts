import { NextRequest, NextResponse } from "next/server";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminFast(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [org, alumnosCount] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: auth.organizationId },
        select: {
          name: true,
          slug: true,
          status: true,
          orgType: true,
          saasPlanName: true,
          saasPlanLimit: true,
          billingCycle: true,
          billingPeriodEnd: true,
          email: true,
          phone: true,
          address: true,
          ownerName: true,
          ownerLastName: true,
          ownerRut: true,
          themePrimaryColor: true,
          themeVariant: true,
          themeMode: true,
        },
      }),
      prisma.organizationMember.count({
        where: { organizationId: auth.organizationId, role: "ALUMNO" },
      }),
    ]);

    if (!org) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ org, alumnosCount });
  } catch (error) {
    console.error("[GET /api/admin/org-config]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
