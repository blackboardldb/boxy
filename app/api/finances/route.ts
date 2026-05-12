import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month"); // 1-12
    const pageParam = searchParams.get("page") || "1";
    const limitParam = searchParams.get("limit") || "10";

    if (!yearParam || !monthParam) {
      return NextResponse.json({ error: "Faltan parámetros year y month" }, { status: 400 });
    }

    const year = parseInt(yearParam);
    const month = parseInt(monthParam);
    const page = parseInt(pageParam);
    const limit = parseInt(limitParam);
    const skip = (page - 1) * limit;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Ingresos — _sum nativo
    const ingresosAgg = await prisma.membershipRenewal.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        OR: [
          { organizationId: auth.organizationId },
          { organizationId: null },
        ],
        status: "approved",
        amount: { not: null }, // excluir registros legacy sin monto
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const ingresosList = await prisma.membershipRenewal.findMany({
      where: {
        OR: [
          { organizationId: auth.organizationId },
          { organizationId: null },
        ],
        status: "approved",
        amount: { not: null }, // excluir registros legacy sin monto
        processedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { processedAt: "desc" },
      skip,
      take: limit,
    });

    // Egresos — misma lógica
    const egresosAgg = await prisma.expense.aggregate({
      _sum: { monto: true },
      _count: { id: true },
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const egresosList = await prisma.expense.findMany({
      where: {
        fecha: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { fecha: "desc" },
      skip,
      take: limit,
    });

    const totalIngresos = ingresosAgg._sum.amount || 0;
    const totalEgresos = egresosAgg._sum.monto || 0;
    
    // Mapeo limpio sin as any
    const mappedIngresos = ingresosList.map((r) => {
      const details = r.renewalDetails as Record<string, unknown> | null;
      return {
        userId: r.userId,
        userName: `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim() || "Sin nombre",
        planName: (details?.requestedPlanName as string) ?? "—",
        amount: r.amount ?? 0,
        processedAt: r.processedAt?.toISOString(),
      };
    });

    const mappedEgresos = egresosList.map((e) => ({
      id: e.id,
      concept: e.motivo,
      amount: e.monto,
      date: e.fecha.toISOString(),
    }));

    const countIngresos = ingresosAgg._count.id;
    const countEgresos = egresosAgg._count.id;

    const totalPages = Math.max(
      Math.ceil(countIngresos / limit),
      Math.ceil(countEgresos / limit),
      1
    );

    return NextResponse.json({
      success: true,
      data: {
        ingresos: {
          total: totalIngresos,
          count: countIngresos,
          items: mappedIngresos,
        },
        egresos: {
          total: totalEgresos,
          count: countEgresos,
          items: mappedEgresos,
        },
        balance: totalIngresos - totalEgresos,
        page,
        totalPages,
      }
    });

  } catch (error) {
    console.error("Error in /api/finances:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
