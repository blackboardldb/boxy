import { prisma } from "../prisma";
import { localToUTC } from "../utils";

// Map day abbreviations to day numbers
const dayMap: { [key: string]: number } = {
  dom: 0,
  lun: 1,
  mar: 2,
  mie: 3,
  jue: 4,
  vie: 5,
  sab: 6,
};


/**
 * Genera clases automáticamente para un único centro (organizationId).
 * Ventana por defecto: 15 días (Hoy inclusive + 14 días futuros).
 *
 * MULTICENTRO: organizationId es obligatorio para garantizar aislamiento entre centros.
 * El cron diario debe invocar esta función en un loop sobre cada centro activo.
 */
export async function generateClassesFromSchedules(
  organizationId: string,
  startDate?: string | Date,
  endDate?: string | Date,
  specificDisciplineId?: string
) {
  // 1. Definir ventana de tiempo (00:00:00 del día actual hasta +14 días)
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date(start);
  if (!endDate) {
    end.setDate(start.getDate() + 14); // Hoy + 14 = 15 días total
  }
  end.setHours(23, 59, 59, 999);
  
  console.log(`[ClassGenerator][${organizationId}] Ventana: ${start.toISOString()} -> ${end.toISOString()}`);

  // 2. Disciplines y instructors SCOPED al centro — nunca mezclar entre centros
  const disciplines = await prisma.discipline.findMany({
    where: { 
      organizationId,           // ← filtro multicentro
      isActive: true,
      ...(specificDisciplineId ? { id: specificDisciplineId } : {}),
    },
  });
  
  const instructors = await prisma.instructor.findMany({
    where: {
      organizationId,           // ← filtro multicentro
      isActive: true,
    },
  });

  const classesToCreate: any[] = [];

  // Generate classes for each discipline based on their schedules
  for (const discipline of disciplines) {
    if (!discipline.schedule) continue;

    const scheduleArray = typeof discipline.schedule === "string" 
      ? JSON.parse(discipline.schedule) 
      : (discipline.schedule as { day: import("../types").DayOfWeek; times: string[] }[]);

    if (!Array.isArray(scheduleArray) || scheduleArray.length === 0) continue;

    // 0. Prioridad 1: Coach asignado explícitamente a la disciplina
    const cancellationPayload = discipline.cancellationRules as any;
    const defaultCoachId: string | undefined =
      !Array.isArray(cancellationPayload) && cancellationPayload?.defaultCoachId
        ? cancellationPayload.defaultCoachId
        : undefined;

    let instructor = defaultCoachId
      ? instructors.find((inst) => inst.id === defaultCoachId && inst.isActive)
      : undefined;

    // 1. Fallback: buscar instructor con la especialidad requerida
    if (!instructor) {
      instructor = instructors.find((inst) => {
        const profile = inst.profile as any;
        const specsObj = profile?.specialties;
        if (!specsObj) return false;
        const specs = typeof specsObj === "string" ? JSON.parse(specsObj) : specsObj;
        return Array.isArray(specs) && specs.includes(discipline.id);
      });
    }

    // 2. Fallback explícito: Instructor Administrador/Maestro del mismo centro
    if (!instructor) {
      instructor = instructors.find((inst) => inst.role === "admin");
    }

    // 3. Fallback final (red de seguridad — mismo centro)
    if (!instructor && instructors.length > 0) {
      console.warn(`[ClassGenerator][${organizationId}] Fallback a instructors[0] para disciplina ${discipline.id}`);
      instructor = instructors[0];
    }

    // 4. Omisión si no hay instructores en este centro
    if (!instructor) {
      console.warn(`[ClassGenerator][${organizationId}] Sin instructor disponible para disciplina ${discipline.id}`);
      continue;
    }

    for (const scheduleDay of scheduleArray) {
      const dayNumber = dayMap[scheduleDay.day];
      if (dayNumber === undefined) continue;

      for (const time of scheduleDay.times) {
        const [hours, minutes] = time.split(":").map(Number);
        
        // Loop over date range
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          if (date.getDay() === dayNumber) {
            const dateStr = [
              date.getFullYear(),
              String(date.getMonth() + 1).padStart(2, "0"),
              String(date.getDate()).padStart(2, "0")
            ].join("-");
            const timeStr = time.replace(":", "");
            // El classId incluye el organizationId para evitar colisiones entre centros
            const classId = `cls_${organizationId.slice(-6)}_${dateStr}_${timeStr}_${discipline.id}`;

            classesToCreate.push({
              id: classId,
              organizationId,                          // ← siempre el del centro actual
              disciplineId: discipline.id,
              name: discipline.name,
              dateTime: new Date(localToUTC(date, time)),
              durationMinutes: discipline.durationMinutes ?? 60,
              instructorId: instructor.id,
              capacity: discipline.capacity ?? 15,
              status: "scheduled",
              notes: "Autogenerada",
              isGenerated: true,
            });
          }
        }
      }
    }
  }

  if (classesToCreate.length > 0) {
    const result = await prisma.classSession.createMany({
      data: classesToCreate,
      skipDuplicates: true,
    });
    console.log(`[ClassGenerator][${organizationId}] Creadas ${result.count} nuevas clases.`);
  }

  return classesToCreate;
}


