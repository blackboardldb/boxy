import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eachDayOfInterval, getDay, format } from "date-fns";
import { ClassSession, DayOfWeek } from "@/lib/types";
import { localToUTC, startOfDayChile, endOfDayChile } from "@/lib/utils";
import { requireAuthFast } from "@/lib/supabase/auth-guard";
import { resolveInstructorForDiscipline } from "@/lib/utils/class-generator";

/**
 * Genera clases para un día específico basado en los horarios de las disciplinas.
 * Esta función NO guarda en la base de datos, solo genera los objetos.
 */
function generateClassesForDay(
  day: Date,
  disciplines: Array<{
    id: string;
    name: string;
    organizationId: string;
    schedule?: any;
    cancellationRules?: any;
  }>,
  organizationId: string,
  instructors: any[]
): ClassSession[] {
  const dayMapping: DayOfWeek[] = [
    "dom",
    "lun",
    "mar",
    "mie",
    "jue",
    "vie",
    "sab",
  ];
  const dayOfWeek = dayMapping[getDay(day)];
  const generatedClasses: ClassSession[] = [];

  disciplines.forEach((discipline) => {
    let scheduleArray: Array<{ day: DayOfWeek; times: string[] }> = [];
    if (discipline.schedule) {
       scheduleArray = typeof discipline.schedule === "string" 
         ? JSON.parse(discipline.schedule) 
         : discipline.schedule;
    }

    if (!Array.isArray(scheduleArray)) return;

    const instructor = resolveInstructorForDiscipline(discipline, instructors, organizationId);
    if (!instructor) return;

    scheduleArray.forEach((s) => {
      if (s.day === dayOfWeek) {
        s.times.forEach((time: string) => {
          const dateTimeStr = localToUTC(day, time);
          const dateString = format(day, "yyyy-MM-dd");

          generatedClasses.push({
            id: `gen_${discipline.id}_${dateString}_${time.replace(":", "-")}`,
            organizationId,
            disciplineId: discipline.id,
            name: discipline.name,
            dateTime: dateTimeStr,
            durationMinutes: 60,
            instructorId: instructor.id,
            capacity: 15,
            status: "scheduled",
            notes: "Clase generada dinámicamente",
            isGenerated: true,
          });
        });
      }
    });
  });
  return generatedClasses;
}

/**
 * Genera clases para un rango de fechas basado en los horarios de las disciplinas.
 */
function generateClassesForDateRange(
  startDate: Date,
  endDate: Date,
  disciplines: any[],
  organizationId: string,
  instructors: any[]
): ClassSession[] {
  const allClasses: ClassSession[] = [];
  const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });

  daysInRange.forEach((day) => {
    const dayClasses = generateClassesForDay(day, disciplines, organizationId, instructors);
    allClasses.push(...dayClasses);
  });

  return allClasses;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuthFast(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  
  const activeOrgId = auth.organizationId;
  if (!activeOrgId) {
    return NextResponse.json({ error: "Tenant no resuelto" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!date && (!startDate || !endDate)) {
    return NextResponse.json(
      { error: "Date parameter or startDate/endDate parameters are required" },
      { status: 400 }
    );
  }

  try {
    let targetStartDate: Date;
    let targetEndDate: Date;

    if (date) {
      targetStartDate = startOfDayChile(date);
      targetEndDate = endOfDayChile(date);
    } else {
      targetStartDate = startOfDayChile(startDate as string);
      targetEndDate = endOfDayChile(endDate as string);
    }

    // 1. Buscar clases REALES que ya existan para ese rango de fechas.
    // NOTA: Se pasan objetos Date directamente, no .toISOString() — igual
    // que en el código original, Prisma falla silenciosamente comparando strings.
    const normalizedRealClasses = await prisma.classSession.findMany({
      where: {
        organizationId: activeOrgId,
        dateTime: {
          gte: targetStartDate,
          lte: targetEndDate,
        },
      },
      take: 1000,
    });

    // 2. Obtener disciplinas activas
    const disciplines = await prisma.discipline.findMany({
      where: { isActive: true, organizationId: activeOrgId },
      take: 100,
    });

    // 2.5. Obtener instructores activos
    const instructors = await prisma.instructor.findMany({
      where: { isActive: true, organizationId: activeOrgId },
      take: 100,
    });

    // 3. Generar todas las clases para el rango completo
    const allGeneratedClasses = generateClassesForDateRange(
      targetStartDate,
      targetEndDate,
      disciplines,
      activeOrgId,
      instructors
    );

    // 4. Combinar clases, dando prioridad a las reales sobre las generadas.
    const classMap = new Map<string, ClassSession>();

    allGeneratedClasses.forEach((cls) => {
      const key = `${cls.disciplineId}:${format(new Date(cls.dateTime), "yyyy-MM-dd:HH-mm")}`;
      classMap.set(key, cls);
    });

    normalizedRealClasses.forEach((cls) => {
      const key = `${cls.disciplineId}:${format(new Date(cls.dateTime), "yyyy-MM-dd:HH-mm")}`;
      classMap.set(key, cls as unknown as ClassSession);
    });

    // 5. Convertir el mapa de vuelta a array y ordenar por fecha
    const allClasses = Array.from(classMap.values()).sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    return NextResponse.json({
      classes: allClasses,
      source: normalizedRealClasses.length > 0 ? "mixed" : "generated",
      count: allClasses.length,
      realClassesCount: normalizedRealClasses.length,
      generatedClassesCount: allClasses.length - normalizedRealClasses.length,
    });
  } catch (error) {
    console.error("Error fetching classes by date range:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
