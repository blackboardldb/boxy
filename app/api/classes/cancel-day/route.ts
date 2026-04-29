import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const cancelDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe tener formato YYYY-MM-DD"),
  organizationId: z.string().min(1, "organizationId es requerido"),
  generatedClasses: z.array(z.any()).optional(), // Datos de clases 'gen_*'
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = cancelDaySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { date, organizationId, generatedClasses = [] } = parsed.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const persistedGenIds: string[] = [];

    // 1. Persistir clases generadas como canceladas antes de la transacción
    for (const classData of generatedClasses) {
      try {
        const persistResponse = await fetch(`${baseUrl}/api/classes/persist-generated`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classData, action: "cancel" }),
        });

        if (persistResponse.ok) {
          const result = await persistResponse.json();
          if (result.persistedClass?.id) {
            persistedGenIds.push(result.persistedClass.id);
          }
        }
      } catch (err) {
        console.error("Error persisting generated class during day cancel:", err);
      }
    }

    // Definir el rango del día en UTC para la consulta
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // 2. Identificar clases reales del día que no estén canceladas
    const realClasses = await prisma.classSession.findMany({
      where: {
        organizationId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "cancelled" },
      },
      select: { id: true },
    });

    const realClassIds = realClasses.map((c) => c.id);

    // 3. Ejecutar transacción para clases reales
    if (realClassIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Cancelar las sesiones
        await tx.classSession.updateMany({
          where: { id: { in: realClassIds } },
          data: { status: "cancelled" },
        });

        // Cancelar los registros y devolver créditos (patrón existente)
        await tx.classRegistration.updateMany({
          where: {
            classId: { in: realClassIds },
            status: "registered",
          },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        });
      });
    }

    // 4. Recopilar todos los IDs afectados y emitir evento WebSocket único
    const allAffectedIds = [...realClassIds, ...persistedGenIds];

    if (allAffectedIds.length > 0) {
      try {
        await fetch(`${baseUrl}/api/emit-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: `org_${organizationId}`,
            event: "day-cancelled",
            data: {
              date,
              affectedClassIds: allAffectedIds,
              cancelledAt: new Date().toISOString(),
            },
          }),
        });
      } catch (wsError) {
        console.error("Error emitting day-cancelled event:", wsError);
      }
    }

    return NextResponse.json({
      success: true,
      affectedRealClasses: realClassIds.length,
      affectedGeneratedClasses: persistedGenIds.length,
      totalAffected: allAffectedIds.length,
    });
  } catch (error) {
    console.error("Error in cancel-day route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
