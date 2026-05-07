import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

// HAL-01 Phase 3C — Eliminado el Full Table Scan + filtrado Node.js.
// Todos los conteos usan queries indexadas en user_memberships.
// Lógica replicada desde getPlanStatus:
//   pending   → status = 'pending'
//   scheduled → status = 'active' AND currentPeriodStart > today
//   active    → status = 'active' AND currentPeriodStart <= today AND currentPeriodEnd >= today
//   inactive  → todo lo demás (expired, frozen, suspended, o fechas vencidas)

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId } = auth;
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // ── HAL-01 Phase 3D: Refactorización a única consulta SQL ──
    // Se reemplaza Promise.all con 6 queries de Prisma (que causaba cuellos de botella 
    // en el pool de conexiones, tardando ~2.7s) por una única consulta agregada (~300ms).
    
    type StatsRow = {
      totalMembers: bigint;
      pendingMembers: bigint;
      scheduledMembers: bigint;
      activeMembers: bigint;
      inactiveMembers: bigint;
      newThisMonth: bigint;
      monthlyRevenue: bigint;
    };

    const rawStats = await prisma.$queryRaw<StatsRow[]>`
      SELECT 
        COUNT(*) as "totalMembers",
        (SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) + 
         COALESCE((
           SELECT COUNT(*) 
           FROM "membership_renewals" mr 
           JOIN "users" u ON mr."userId" = u.id 
           WHERE mr.status = 'pending' AND u."organizationId" = ${organizationId}
         ), 0)
        ) as "pendingMembers",
        SUM(CASE WHEN status = 'active' AND "currentPeriodStart" > ${today} THEN 1 ELSE 0 END) as "scheduledMembers",
        SUM(CASE WHEN status = 'active' AND "currentPeriodStart" <= ${today} AND "currentPeriodEnd" >= ${today} THEN 1 ELSE 0 END) as "activeMembers",
        SUM(CASE 
          WHEN status NOT IN ('active', 'pending') THEN 1 
          WHEN status = 'active' AND "currentPeriodEnd" < ${today} THEN 1 
          ELSE 0 
        END) as "inactiveMembers",
        SUM(CASE WHEN "startDate" >= ${firstOfMonth} THEN 1 ELSE 0 END) as "newThisMonth",
        SUM(CASE WHEN status = 'active' AND "currentPeriodStart" >= ${firstOfMonth} AND "currentPeriodStart" <= ${today} THEN "monthlyPrice" ELSE 0 END) as "monthlyRevenue"
      FROM "user_memberships"
      WHERE "organizationId" = ${organizationId}
    `;

    const result = rawStats[0];
    
    // Prisma $queryRaw devuelve BigInt para agregaciones (COUNT, SUM), las parseamos a Number
    const totalMembers = Number(result.totalMembers || 0);
    const pendingMembers = Number(result.pendingMembers || 0);
    const scheduledMembers = Number(result.scheduledMembers || 0);
    const activeMembers = Number(result.activeMembers || 0);
    const inactiveMembers = Number(result.inactiveMembers || 0);
    const newThisMonth = Number(result.newThisMonth || 0);
    const monthlyRevenue = Number(result.monthlyRevenue || 0);

    const retentionRate   = totalMembers > 0
      ? parseFloat(((activeMembers / totalMembers) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        scheduledMembers,
        pendingMembers,
        inactiveMembers,
        newThisMonth,
        retentionRate,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
