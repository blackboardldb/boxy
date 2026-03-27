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
 * Genera clases automáticamente masivamente usando createMany (ultra rápido).
 * Ventana por defecto: 15 días (Hoy inclusive + 14 días futuros).
 */
export async function generateClassesFromSchedules(
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
  
  console.log(`[ClassGenerator] Proyectando ventana: ${start.toISOString()} -> ${end.toISOString()}`);

  // Fetch real disciplines and instructors from the DB
  const disciplines = await prisma.discipline.findMany({
    where: { 
      isActive: true,
      ...(specificDisciplineId ? { id: specificDisciplineId } : {})
    },
  });
  
  const instructors = await prisma.instructor.findMany({
    where: { isActive: true },
  });

  const classesToCreate: any[] = [];

  // Generate classes for each discipline based on their schedules
  for (const discipline of disciplines) {
    if (!discipline.schedule) continue;

    let scheduleArray = typeof discipline.schedule === "string" 
      ? JSON.parse(discipline.schedule) 
      : (discipline.schedule as any);

    if (!Array.isArray(scheduleArray) || scheduleArray.length === 0) continue;

    const instructor = instructors.find((inst: any) => {
      const specsObj = inst.profile?.specialties || inst.specialties;
      if (!specsObj) return false;
      const specs = typeof specsObj === "string" ? JSON.parse(specsObj) : specsObj;
      return Array.isArray(specs) && specs.includes(discipline.id);
    }) || instructors[0];

    if (!instructor) continue;

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
            const classId = `cls_${dateStr}_${timeStr}_${discipline.id}`;

            classesToCreate.push({
              id: classId,
              organizationId: (discipline as any).organizationId || "org_blacksheep_001",
              disciplineId: discipline.id,
              name: discipline.name,
              dateTime: new Date(localToUTC(date, time)),
              durationMinutes: 60,
              instructorId: instructor.id,
              capacity: 15,
              registeredParticipantsIds: [],
              waitlistParticipantsIds: [],
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
    // Bulk create skipping already existing ones (by ID)
    const result = await prisma.classSession.createMany({
      data: classesToCreate,
      skipDuplicates: true,
    });
    console.log(`[ClassGenerator] Proceso masivo completado. Creadas ${result.count} nuevas clases.`);
  }

  return classesToCreate;
}
