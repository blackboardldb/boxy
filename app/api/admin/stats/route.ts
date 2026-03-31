import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { getPlanStatus } from "@/lib/utils";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId } = auth;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayStr = today.toISOString().split("T")[0];
    const firstOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;

    // Revertimos el filtro de DB por JSON (que causaba Full Table Scan) a filtrado en Node.js.
    // Traemos solo alumnos con su campo membership.
    const allStudents = await (prisma as any).user.findMany({
      where: {
        role: "user",
      },
      select: {
        membership: true,
      },
    });

    // Filtramos por organización en memoria para recuperar la velocidad de la Fase 1.
    const students = allStudents.filter((s: any) => {
      const m = s.membership as any;
      return m?.organizationId === organizationId;
    });

    const totalMembers = students.length;
    let activeMembers = 0;
    let scheduledMembers = 0;
    let pendingMembers = 0;
    let inactiveMembers = 0;
    let newThisMonth = 0;
    let monthlyRevenue = 0;

    for (const student of students) {
      const m = student.membership as any;
      if (!m) {
        inactiveMembers++;
        continue;
      }
      
      const status = getPlanStatus(student);

      if (status === "active") activeMembers++;
      else if (status === "scheduled") scheduledMembers++;
      else if (status === "pending") pendingMembers++;
      else if (status === "inactive") inactiveMembers++;

      // Nuevos este mes: startDate dentro del mes actual
      if (m.startDate && m.startDate >= firstOfMonth) {
        newThisMonth++;
      }

      // Ingresos del mes: activos cuyo periodo inició este mes
      if (status === "active" && (m.currentPeriodStart || m.startDate) >= firstOfMonth) {
        monthlyRevenue += Number(m.monthlyPrice || 0);
      }
    }

    const retentionRate =
      totalMembers > 0
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
