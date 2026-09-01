import { NextResponse } from "next/server";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { startOfMonthChile, getCurrentChileTime } from "@/lib/utils";

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
//
// PERFORMANCE: Las 3 queries originales (membresías + ingresos + egresos) se
// consolidaron en un solo CTE para eliminar 2 roundtrips al connection pooler.
// Latencia objetivo: < 500ms (vs ~5s original con 3 queries seriales).

import { NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId } = auth;

    // Rango de mes en horario de Chile — ver lib/utils.ts
    // toZonedTime() desplaza el timestamp UTC internamente; los getters correctos
    // para leer el resultado son los *UTC* (getUTCFullYear/getUTCMonth), no los
    // locales — los locales dependerían del TZ del proceso (UTC-4 en esta máquina,
    // UTC+0 en Vercel), reintroduciendo exactamente el bug que quisimos cerrar.
    const today            = new Date(); // instante absoluto para comparaciones SQL
    const todayChile       = getCurrentChileTime(); // mes/año en horario chileno
    const firstOfMonth     = startOfMonthChile(todayChile.getUTCFullYear(), todayChile.getUTCMonth());
    const firstOfNextMonth = startOfMonthChile(todayChile.getUTCFullYear(), todayChile.getUTCMonth() + 1);

    // ── Query única con CTE — elimina 2 roundtrips al connection pooler ──────
    // Antes: 3 queries seriales (~5s total en producción con pooler transaction mode)
    // Ahora: 1 CTE que corre todo en el mismo plan de ejecución de Postgres
    type DashboardRow = {
      totalMembers:     bigint;
      pendingMembers:   bigint;
      scheduledMembers: bigint;
      activeMembers:    bigint;
      inactiveMembers:  bigint;
      newThisMonth:     bigint;
      monthlyRevenue:   number | null;
      monthlyEgresos:   number | null;
      saasPlanLimit:    number | null;
      overrideMaxActiveStudents: number | null;
    };

    const [row] = await prisma.$queryRaw<DashboardRow[]>`
      WITH
        membership_counts AS (
          SELECT
            COUNT(u.id)                                                                  AS "totalMembers",
            SUM(CASE WHEN um.status = 'pending' THEN 1 ELSE 0 END)                       AS "pendingFromMemberships",
            SUM(CASE WHEN um.status = 'active' AND um."currentPeriodStart" > ${today}
                     THEN 1 ELSE 0 END)                                                  AS "scheduledMembers",
            SUM(CASE WHEN um.status = 'active'
                          AND um."currentPeriodStart" <= ${today}
                          AND um."currentPeriodEnd"   >= ${today}
                     THEN 1 ELSE 0 END)                                                  AS "activeMembers",
            SUM(CASE
                  WHEN um.status IS NULL THEN 1
                  WHEN um.status NOT IN ('active', 'pending') THEN 1
                  WHEN um.status = 'active' AND um."currentPeriodEnd" < ${today} THEN 1
                  ELSE 0
                END)                                                                     AS "inactiveMembers",
            SUM(CASE WHEN um."startDate" >= ${firstOfMonth} THEN 1 ELSE 0 END)           AS "newThisMonth"
          FROM "users" u
          LEFT JOIN "user_memberships" um ON um."userId" = u.id
          JOIN "organization_members" om ON om."userId" = u.id
          WHERE om."organizationId" = ${organizationId}
            AND om.role = 'ALUMNO'
            AND u."deletedAt" IS NULL
        ),
        renewal_pending AS (
          SELECT COUNT(*) AS cnt
          FROM "membership_renewals" mr
          WHERE mr.status = 'pending'
            AND mr."organizationId" = ${organizationId}
        ),
        revenue AS (
          SELECT COALESCE(SUM(mr.amount), 0)::float AS "monthlyRevenue"
          FROM "membership_renewals" mr
          WHERE mr."organizationId" = ${organizationId}
            AND mr.status  = 'approved'
            AND mr.amount  IS NOT NULL
            AND mr."processedAt" >= ${firstOfMonth}
            AND mr."processedAt" <  ${firstOfNextMonth}
        ),
        egresos AS (
          SELECT COALESCE(SUM(monto), 0)::float AS "monthlyEgresos"
          FROM "expenses"
          WHERE fecha >= ${firstOfMonth}
            AND fecha <  ${firstOfNextMonth}
            AND "organizationId" = ${organizationId}
        ),
        org_info AS (
          SELECT "saasPlanLimit", "overrideMaxActiveStudents"
          FROM "organizations"
          WHERE id = ${organizationId}
        )
      SELECT
        mc."totalMembers",
        (mc."pendingFromMemberships" + rp.cnt)  AS "pendingMembers",
        mc."scheduledMembers",
        mc."activeMembers",
        mc."inactiveMembers",
        mc."newThisMonth",
        rv."monthlyRevenue",
        eg."monthlyEgresos",
        oi."saasPlanLimit",
        oi."overrideMaxActiveStudents"
      FROM membership_counts mc
      CROSS JOIN renewal_pending rp
      CROSS JOIN revenue rv
      CROSS JOIN egresos eg
      CROSS JOIN org_info oi
    `;

    // Prisma $queryRaw devuelve BigInt para COUNT/SUM de enteros; lo parseamos a Number
    const totalMembers     = Number(row.totalMembers     || 0);
    const pendingMembers   = Number(row.pendingMembers   || 0);
    const scheduledMembers = Number(row.scheduledMembers || 0);
    const activeMembers    = Number(row.activeMembers    || 0);
    const inactiveMembers  = Number(row.inactiveMembers  || 0);
    const newThisMonth     = Number(row.newThisMonth     || 0);

    // Revenue y egresos ya vienen como float desde el CAST en Postgres
    const monthlyRevenue = Number(row.monthlyRevenue ?? 0);
    const monthlyEgresos = Number(row.monthlyEgresos ?? 0);

    const retentionRate = totalMembers > 0
      ? parseFloat(((activeMembers / totalMembers) * 100).toFixed(1))
      : 0;

    const response = NextResponse.json({
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
        saasPlanLimit: row.saasPlanLimit ?? null,
        overrideMaxActiveStudents: row.overrideMaxActiveStudents ?? null,
      },
    });

    // Cache en Vercel Edge / CDN por 5 min (alineado con staleTime de React Query).
    // stale-while-revalidate permite servir el caché mientras revalida en background.
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
