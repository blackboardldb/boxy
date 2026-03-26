import { prisma } from "../prisma";

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

// Helper function to create local date string representing the correct local time (Santiago de Chile)
function createLocalDateTimeStr(
  date: Date,
  hours: number,
  minutes: number
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(hours).padStart(2, "0");
  const minute = String(minutes).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:00.000-03:00`;
}

/**
 * Genera clases automáticamente masivamente usando createMany (ultra rápido).
 */
export async function generateClassesFromSchedules(
  startDate: string | Date,
  endDate: string | Date,
  specificDisciplineId?: string
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
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
      : discipline.schedule;

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
              dateTime: new Date(createLocalDateTimeStr(date, hours, minutes)),
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
    await prisma.classSession.createMany({
      data: classesToCreate,
      skipDuplicates: true,
    });
    console.log(`[ClassGenerator] Proceso masivo completado. Se intentaron crear ${classesToCreate.length} clases.`);
  }

  return classesToCreate;
}
