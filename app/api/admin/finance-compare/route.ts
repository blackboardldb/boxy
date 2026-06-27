import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

// GET /api/admin/finance-compare
// Retorna ingresos, egresos y balance del mes actual y el mes anterior
// para la tarjeta comparativa del dashboard.
// Se mantiene como endpoint separado para que el dashboard principal
// no dependa de esta query al momento de renderizar.

import { NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId: authOrgId } = auth;
    const organizationId = request.headers.get("x-organization-id") || authOrgId;

    // ⚠️ Siempre UTC — evita discrepancias localhost vs Vercel
    const today              = new Date();
    const firstOfMonth       = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(),     1));
    const firstOfNextMonth   = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
    const firstOfPrevMonth   = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));

    type CompareRow = {
      currentRevenue:  number | null;
      currentEgresos:  number | null;
      prevRevenue:     number | null;
      prevEgresos:     number | null;
    };

    const [row] = await prisma.$queryRaw<CompareRow[]>`
      WITH
        current_revenue AS (
          SELECT COALESCE(SUM(mr.amount), 0)::float AS val
          FROM "membership_renewals" mr
          WHERE mr."organizationId" = ${organizationId}
            AND mr.status      = 'approved'
            AND mr.amount      IS NOT NULL
            AND mr."processedAt" >= ${firstOfMonth}
            AND mr."processedAt" <  ${firstOfNextMonth}
        ),
        prev_revenue AS (
          SELECT COALESCE(SUM(mr.amount), 0)::float AS val
          FROM "membership_renewals" mr
          WHERE mr."organizationId" = ${organizationId}
            AND mr.status      = 'approved'
            AND mr.amount      IS NOT NULL
            AND mr."processedAt" >= ${firstOfPrevMonth}
            AND mr."processedAt" <  ${firstOfMonth}
        ),
        current_egresos AS (
          SELECT COALESCE(SUM(monto), 0)::float AS val
          FROM "expenses"
          WHERE fecha >= ${firstOfMonth}
            AND fecha <  ${firstOfNextMonth}
            AND "organizationId" = ${organizationId}
        ),
        prev_egresos AS (
          SELECT COALESCE(SUM(monto), 0)::float AS val
          FROM "expenses"
          WHERE fecha >= ${firstOfPrevMonth}
            AND fecha <  ${firstOfMonth}
            AND "organizationId" = ${organizationId}
        )
      SELECT
        cr.val  AS "currentRevenue",
        ce.val  AS "currentEgresos",
        pr.val  AS "prevRevenue",
        pe.val  AS "prevEgresos"
      FROM current_revenue cr
      CROSS JOIN prev_revenue   pr
      CROSS JOIN current_egresos ce
      CROSS JOIN prev_egresos    pe
    `;

    const currentRevenue = Number(row.currentRevenue ?? 0);
    const prevRevenue    = Number(row.prevRevenue    ?? 0);
    const currentEgresos = Number(row.currentEgresos ?? 0);
    const prevEgresos    = Number(row.prevEgresos    ?? 0);

    const currentBalance = currentRevenue - currentEgresos;
    const prevBalance    = prevRevenue    - prevEgresos;

    // Calcula la variación porcentual con 1 decimal; null si no hay base de comparación
    const pct = (current: number, prev: number): number | null => {
      if (prev === 0) return null;
      return parseFloat((((current - prev) / prev) * 100).toFixed(1));
    };

    const response = NextResponse.json({
      success: true,
      data: {
        currentRevenue,
        prevRevenue,
        revenuePct: pct(currentRevenue, prevRevenue),

        currentEgresos,
        prevEgresos,
        egresosPct: pct(currentEgresos, prevEgresos),

        currentBalance,
        prevBalance,
        balancePct: pct(currentBalance, prevBalance),
      },
    });

    // Caché más corto (2 min) porque las comparativas cambian a lo largo del mes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=30"
    );

    return response;
  } catch (error) {
    console.error("[GET /api/admin/finance-compare]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
