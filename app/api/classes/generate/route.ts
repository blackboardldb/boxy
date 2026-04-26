import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { localToUTC } from "@/lib/utils";
import { z } from "zod";

const generateClassesSchema = z.object({
  startDate:   z.string().min(1, "startDate es requerido"),
  endDate:     z.string().min(1, "endDate es requerido"),
  disciplineId: z.string().min(1, "disciplineId es requerido"),
  instructorId: z.string().min(1, "instructorId es requerido"),
  time:        z.string().min(1, "time es requerido"),
  maxCapacity: z.number().positive().default(15),
  notes:       z.string().default("Clase generada"),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = generateClassesSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { startDate, endDate, disciplineId, instructorId, time, maxCapacity, notes } = parsed.data;

    console.log("=== API: Generando clases ===", { startDate, endDate, disciplineId, instructorId, time });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const generatedClasses = [];

    const [hours, minutes] = time.split(":").map(Number);
    const discipline = await prisma.discipline.findUnique({
      where: { id: disciplineId }
    });

    if (!discipline) {
      return NextResponse.json({ error: "Discipline not found" }, { status: 404 });
    }

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isExtraClass = notes.includes("Clase extra");

      if (isWeekend && !isExtraClass) {
        continue;
      }

      const classDateTimeStr = localToUTC(date, time);
      const classDateTimeObj = new Date(classDateTimeStr);

      const dateStr = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");
      const timeStr = time.replace(":", "");

      // Evita claves duplicadas o re-generar
      const classId = `cls_${dateStr}_${timeStr}_${disciplineId}`;
      const existingClass = await prisma.classSession.findUnique({
        where: { id: classId },
      });

      if (!existingClass) {
        const newClass = await prisma.classSession.create({
          data: {
            id: classId,
            organizationId: discipline.organizationId || "org_blacksheep_001",
            disciplineId,
            name: `Class ${time}`,
            dateTime: classDateTimeObj,
            durationMinutes: 60,
            instructorId,
            capacity: maxCapacity,
            status: "scheduled",
            notes,
          },
        });
        generatedClasses.push(newClass);
      }
    }

    return NextResponse.json({
        message: `Successfully generated ${generatedClasses.length} classes`,
        classes: generatedClasses,
    }, { status: 201 });
  } catch (error) {
    console.error("Error generating classes:", error);
    return NextResponse.json({ error: "Failed to generate classes" }, { status: 500 });
  }
}
