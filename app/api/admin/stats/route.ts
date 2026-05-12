import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

// ── Fuente de Verdad Unificada ──────────────────────────────────────────────
// monthlyRevenue = SUM(amount) de membership_renewals WHERE status='approved'
//   y processedAt en el mes actual → IDÉNTICO a /api/finances.
// Esto elimina la discrepancia histórica donde el Dashboard leía monthlyPrice
// de user_memberships (proyección MRR) mientras Finanzas leía la caja real.
//
// Lógica de estados (replicada de getPlanStatus):
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
    const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // ── Query 1: Conteos de membresías desde user_memberships ──────────────
    type StatsRow = {
      totalMembers: bigint;
      pendingMembers: bigint;
      scheduledMembers: bigint;
      activeMembers: bigint;
      inactiveMembers: bigint;
      newThisMonth: bigint;
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
        SUM(CASE WHEN "startDate" >= ${firstOfMonth} THEN 1 ELSE 0 END) as "newThisMonth"
      FROM "user_memberships"
      WHERE "organizationId" = ${organizationId}
    `;

    // ── Query 2: Ingresos reales del mes desde membership_renewals ─────────
    // FUENTE DE VERDAD: misma lógica que /api/finances
    type RevenueRow = { monthlyRevenue: number | null };
    const rawRevenue = await prisma.$queryRaw<RevenueRow[]>`
      SELECT COALESCE(SUM(mr.amount), 0)::float AS "monthlyRevenue"
      FROM "membership_renewals" mr
      JOIN "users" u ON mr."userId" = u.id
      WHERE u."organizationId" = ${organizationId}
        AND mr.status = 'approved'
        AND mr.amount IS NOT NULL
        AND mr."processedAt" >= ${firstOfMonth}
        AND mr."processedAt" < ${firstOfNextMonth}
    `;

    // ── Query 3: Egresos del mes desde expenses ────────────────────────────
    type EgresosRow = { monthlyEgresos: number | null };
    const rawEgresos = await prisma.$queryRaw<EgresosRow[]>`
      SELECT COALESCE(SUM(monto), 0)::float AS "monthlyEgresos"
      FROM "expenses"
      WHERE fecha >= ${firstOfMonth}
        AND fecha < ${firstOfNextMonth}
    `;

    const result = rawStats[0];

    // Prisma $queryRaw devuelve BigInt para COUNT/SUM de enteros; lo parseamos a Number
    const totalMembers    = Number(result.totalMembers    || 0);
    const pendingMembers  = Number(result.pendingMembers  || 0);
    const scheduledMembers = Number(result.scheduledMembers || 0);
    const activeMembers   = Number(result.activeMembers   || 0);
    const inactiveMembers = Number(result.inactiveMembers || 0);
    const newThisMonth    = Number(result.newThisMonth    || 0);

    // Revenue y egresos ya vienen como float desde el CAST
    const monthlyRevenue = Number(rawRevenue[0]?.monthlyRevenue ?? 0);
    const monthlyEgresos = Number(rawEgresos[0]?.monthlyEgresos ?? 0);

    const retentionRate = totalMembers > 0
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
        monthlyRevenue,  // Caja real: SUM(membership_renewals.amount) aprobados este mes
        monthlyEgresos,  // Egresos: SUM(expenses.monto) del mes
        monthlyBalance: monthlyRevenue - monthlyEgresos,
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
