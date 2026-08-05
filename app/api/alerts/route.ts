import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function GET(request: NextRequest) {
  try {
    // [BUG-ALERT-03] Auth guard obligatorio: sin él cualquier petición anónima
    // recibía todas las alertas de todos los centros.
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const activeOrgId = request.headers.get("x-organization-id");
    if (!activeOrgId) {
      return NextResponse.json({ error: "Tenant no resuelto" }, { status: 400 });
    }

    const now = new Date();
    // Filtrar por organizationId del alumno autenticado para garantizar aislamiento multi-tenant.
    // Las alertas globales del sistema (organizationId: null) son gestionadas por Superadmin
    // y no se exponen por esta ruta de alumno.
    const alerts = await prisma.inAppAlert.findMany({
      where: {
        organizationId: activeOrgId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    return NextResponse.json({ error: "Failed to fetch active alerts" }, { status: 500 });
  }
}
