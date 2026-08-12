import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { startOfDayChile, endOfDayChile } from "@/lib/utils";
import { sendToUsers } from "@/lib/services/push-service";

const cancelBulkSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido. Se espera YYYY-MM-DD"),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const activeOrgId = auth.organizationId;

    const parsed = cancelBulkSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { date } = parsed.data;

    console.log("🔍 API cancel-bulk recibió fecha:", date);
    console.log("🔍 Tipo de fecha:", typeof date);
    console.log("✅ Formato de fecha válido:", date);

    // Get all classes for the specified date
    // Buscar clases que contengan la fecha en su dateTime
    console.log("🔍 Buscando clases para la fecha:", date);

    const classes = await prisma.classSession.findMany({
      where: {
        organizationId: activeOrgId,
        dateTime: {
          // Utilizar helpers de horario chileno para que el rango de día sea preciso
          gte: startOfDayChile(date),
          lte: endOfDayChile(date),
        },
        status: { not: "cancelled" },
      },
    });

    console.log("📊 Clases encontradas:", classes.length);
    classes.forEach((cls) => {
      console.log(`  - ${cls.id}: ${cls.dateTime}`);
    });

    if (classes.length === 0) {
      return NextResponse.json(
        { error: "No classes found for this date" },
        { status: 404 }
      );
    }

    // Cancel all classes for the date
    const classIds = classes.map((c) => c.id);

    // Capturar afectados ANTES de actualizar (igual criterio que cancel-day)
    const registrations = await prisma.classRegistration.findMany({
      where: { classId: { in: classIds }, status: "registered" },
      select: { userId: true },
    });
    const uniqueAffectedUsers = [...new Set(registrations.map((r) => r.userId))];

    await prisma.$transaction([
      prisma.classSession.updateMany({
        where: { id: { in: classIds }, organizationId: activeOrgId },
        data: { status: "cancelled" },
      }),
      prisma.classRegistration.updateMany({
        where: { classId: { in: classIds }, status: "registered" },
        data: { status: "cancelled", cancelledAt: new Date() },
      }),
    ]);

    // Notificar — awaited a propósito (ver nota sobre Serverless en alerts/route.ts)
    if (uniqueAffectedUsers.length > 0) {
      try {
        await sendToUsers(uniqueAffectedUsers, activeOrgId, {
          title: "Clase Cancelada",
          body: `Se cancelaron las clases del ${date}.`,
          type: "cancelacion",
        });
      } catch (pushErr) {
        console.error("Error enviando push de cancelación (cancel-bulk):", pushErr);
      }
    }

    return NextResponse.json({
      message: `Successfully cancelled ${classIds.length} classes for ${date}`,
      cancelledClasses: classIds,
      affectedUsers: uniqueAffectedUsers,
    });
  } catch (error) {
    console.error("Error cancelling classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
