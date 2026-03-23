import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to create local date string representing the correct local time
// Assuming America/Santiago (UTC-3 or UTC-4). By constructing an ISO string with -03:00,
// Prisma will correctly parse it as UTC without losing the intended local hour.
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

  // Al crear el string ISO con offset -03:00, Prisma lo guarda en UTC equivalente.
  // Esto es mejor que dejarlo local del servidor.
  return `${year}-${month}-${day}T${hour}:${minute}:00.000-03:00`;
}

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

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: startDate, endDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const generatedClasses = [];

    // Fetch real disciplines and instructors from the DB
    const disciplines = await prisma.discipline.findMany({
      where: { isActive: true },
    });
    const instructors = await prisma.instructor.findMany({
      where: { isActive: true },
    });

    // Generate classes for each discipline based on their schedules
    for (const discipline of disciplines) {
      if (!discipline.schedule) continue;

      let scheduleArray = [];
      try {
        scheduleArray = typeof discipline.schedule === "string" 
          ? JSON.parse(discipline.schedule) 
          : discipline.schedule;
      } catch (e) {
        console.error("Error parsing schedule for discipline:", discipline.id);
        continue;
      }

      if (!Array.isArray(scheduleArray) || scheduleArray.length === 0) continue;

      // Find instructor for this discipline. In DB, specialties is likely a JSON or array of IDs.
      const instructor = instructors.find((inst: any) => {
        if (!inst.specialties) return false;
        try {
          const specs = typeof inst.specialties === "string" 
            ? JSON.parse(inst.specialties) 
            : inst.specialties;
          return Array.isArray(specs) && specs.includes(discipline.id);
        } catch {
          return false;
        }
      });

      if (!instructor) {
        console.warn(`No instructor found for discipline: ${discipline.name}`);
        continue; // Or we can assign it without instructor? Original code skipes it.
      }

      // Generate classes for each day in the schedule
      for (const scheduleDay of scheduleArray) {
        const dayNumber = dayMap[scheduleDay.day];
        if (dayNumber === undefined) continue;

        // Generate classes for each time slot
        for (const time of scheduleDay.times) {
          const [hours, minutes] = time.split(":").map(Number);

          // Generate classes for each day in the range
          // Resets date to start inside loop to avoid mutation issues
          for (
            let date = new Date(start);
            date <= end;
            date.setDate(date.getDate() + 1)
          ) {
            // Check if this day matches the schedule day
            if (date.getDay() === dayNumber) {
              const classDateTimeStr = createLocalDateTimeStr(date, hours, minutes);
              // Parsing back to date object to give Prisma realistic Date instead of string
              const classDateTimeObj = new Date(classDateTimeStr);

              // Format date for ID construction
              const dateStr = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0")
              ].join("-");
              const timeStr = time.replace(":", "");
              const classId = `cls_${dateStr}_${timeStr}_${discipline.id}`;

              // Check if class already exists
              const existingClass = await prisma.classSession.findUnique({
                where: { id: classId },
              });

              if (!existingClass) {
                const newClass = await prisma.classSession.create({
                  data: {
                    id: classId,
                    organizationId: discipline.organizationId || "org_blacksheep_001",
                    disciplineId: discipline.id,
                    name: discipline.name,
                    dateTime: classDateTimeObj, // Use Date object
                    durationMinutes: 60,
                    instructorId: instructor.id,
                    capacity: 15, // default
                    registeredParticipantsIds: [],
                    waitlistParticipantsIds: [],
                    status: "scheduled",
                    notes: "Autogenerada",
                  },
                });

                generatedClasses.push(newClass);
              }
            }
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: `Successfully generated ${generatedClasses.length} classes automatically from discipline schedules`,
        classes: generatedClasses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating classes automatically:", error);
    return NextResponse.json(
      { error: "Failed to generate classes automatically" },
      { status: 500 }
    );
  }
}
