import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eachDayOfInterval, getDay, format } from "date-fns";
import { ClassSession, DayOfWeek } from "@/lib/types";
import { getChileOffset, localToUTC } from "@/lib/utils";
import { getDataProvider } from "@/lib/data-layer/provider-factory";

/**
 * Genera clases para un día específico basado en los horarios de las disciplinas.
 * Esta función NO guarda en la base de datos, solo genera los objetos.
 */
function generateClassesForDay(
  day: Date,
  disciplines: Array<{
    id: string;
    name: string;
    schedule?: any; // Usamos any para manejar el JSON de Prisma localmente
  }>
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

    scheduleArray.forEach((s) => {
      if (s.day === dayOfWeek) {
        s.times.forEach((time: string) => {
          // Usar la utilidad localToUTC que maneja el offset dinámico de Chile
          const dateTimeStr = localToUTC(day, time);
          const dateString = format(day, "yyyy-MM-dd");

          generatedClasses.push({
            id: `gen_${discipline.id}_${dateString}_${time.replace(":", "-")}`,
            organizationId: "org_blacksheep_001",
            disciplineId: discipline.id,
            name: discipline.name,
            dateTime: dateTimeStr,
            durationMinutes: 60,
            instructorId: "inst_default",
            capacity: 15,
            registeredParticipantsIds: [],
            waitlistParticipantsIds: [],
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
  disciplines: any[]
): ClassSession[] {
  const allClasses: ClassSession[] = [];
  const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });

  daysInRange.forEach((day) => {
    const dayClasses = generateClassesForDay(day, disciplines);
    allClasses.push(...dayClasses);
  });

  return allClasses;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // Para compatibilidad con un solo día
  const startDate = searchParams.get("startDate"); // Para rango de fechas
  const endDate = searchParams.get("endDate"); // Para rango de fechas

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
      // Modo de compatibilidad: un solo día respetando el offset de Chile
      const offset = getChileOffset(new Date(`${date}T12:00:00`));
      targetStartDate = new Date(`${date}T00:00:00.000${offset}`);
      targetEndDate = new Date(`${date}T23:59:59.999${offset}`);
    } else {
      // Modo de rango: mes completo respetando el offset de Chile
      const offsetStart = getChileOffset(new Date(`${startDate}T12:00:00`));
      const offsetEnd = getChileOffset(new Date(`${endDate}T12:00:00`));
      
      targetStartDate = new Date(`${startDate}T00:00:00.000${offsetStart}`);
      targetEndDate = new Date(`${endDate}T23:59:59.999${offsetEnd}`);
    }

    const provider = getDataProvider();

    // 1. Buscar clases REALES que ya existan para ese rango de fechas en la BD usando repositorio
    const realClassesResult = await provider.classes.findMany({
      where: {
        dateTime: {
          gte: targetStartDate.toISOString(),
          lte: targetEndDate.toISOString(),
        },
      },
      limit: 1000,
    });
    
    const normalizedRealClasses = realClassesResult.items;

    // 2. Obtener disciplinas activas via repositorio
    const disciplinesResult = await provider.disciplines.findMany({
      where: { isActive: true },
      limit: 100,
    });
    const disciplines = disciplinesResult.items;

    // 3. Generar todas las clases para el rango completo
    const allGeneratedClasses = generateClassesForDateRange(
      targetStartDate,
      targetEndDate,
      disciplines
    );

    // 4. Combinar clases, dando prioridad a las reales sobre las generadas.
    // Usamos un Map para evitar duplicados en el mismo slot de tiempo/disciplina.
    const classMap = new Map<string, ClassSession>();

    // Primero, agregar todas las clases generadas al mapa.
    allGeneratedClasses.forEach((cls) => {
      const key = `${cls.disciplineId}:${format(new Date(cls.dateTime), "yyyy-MM-dd:HH-mm")}`;
      classMap.set(key, cls);
    });

    // Luego, sobrescribir con las clases reales. Si una clase real ocupa el mismo
    // slot que una generada, la real tendrá precedencia.
    normalizedRealClasses.forEach((cls) => {
      const key = `${cls.disciplineId}:${format(new Date(cls.dateTime), "yyyy-MM-dd:HH-mm")}`;
      classMap.set(key, cls);
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
