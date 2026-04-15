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

    const baseWhere = { organizationId };

    // ── Conteos paralelos — todos usan índice btree (sin Full Table Scan) ──
    const [
      totalMembers,
      pendingMembers,
      scheduledMembers,
      activeMembers,
      newThisMonth,
      revenueResult,
    ] = await Promise.all([
      // Total alumnos con membresía
      prisma.userMembership.count({
        where: baseWhere,
      }),

      // Pendientes: usuarios nuevos sin plan aprobado
      prisma.userMembership.count({
        where: { ...baseWhere, status: "pending" },
      }),

      // Programados: plan futuro (aún no inició)
      prisma.userMembership.count({
        where: {
          ...baseWhere,
          status: "active",
          currentPeriodStart: { gt: today },
        },
      }),

      // Activos: plan vigente hoy
      prisma.userMembership.count({
        where: {
          ...baseWhere,
          status: "active",
          currentPeriodStart: { lte: today },
          currentPeriodEnd:   { gte: today },
        },
      }),

      // Nuevos este mes: startDate dentro del mes actual
      prisma.userMembership.count({
        where: {
          ...baseWhere,
          startDate: { gte: firstOfMonth },
        },
      }),

      // Ingresos del mes: activos cuyo currentPeriodStart es este mes
      prisma.userMembership.aggregate({
        where: {
          ...baseWhere,
          status: "active",
          currentPeriodStart: { gte: firstOfMonth, lte: today },
        },
        _sum: { monthlyPrice: true },
      }),
    ]);

    // Inactivos = total − activos − programados − pendientes
    const inactiveMembers = totalMembers - activeMembers - scheduledMembers - pendingMembers;
    const monthlyRevenue  = revenueResult._sum.monthlyPrice ?? 0;
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
