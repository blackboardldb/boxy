import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClassSession } from "@/lib/types";
import { z } from "zod";

const persistGeneratedSchema = z.object({
  classData: z.object({
    id:                       z.string(),
    organizationId:           z.string(),
    disciplineId:             z.string(),
    name:                     z.string(),
    dateTime:                 z.string(),
    durationMinutes:          z.number(),
    instructorId:             z.string().optional(),
    capacity:                 z.number(),
    registeredParticipantsIds: z.array(z.string()).optional(),
    waitlistParticipantsIds:  z.array(z.string()).optional(),
    status:                   z.string().optional(),
    notes:                    z.string().optional(),
  }),
  action: z.string().min(1, "action es requerido"),
});

/**
 * Persiste una clase generada en la base de datos.
 * Se usa cuando el admin interactúa con una clase generada (cancela, modifica, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = persistGeneratedSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { classData, action } = parsed.data;

    // Validar que es una clase generada
    if (!classData.id.startsWith("gen_")) {
      return NextResponse.json(
        { error: "Only generated classes can be persisted" },
        { status: 400 }
      );
    }

    // Crear un ID real para la clase persistida
    const realId = `cls_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Preparar los datos de la clase para persistir
    const classToPersist: Omit<ClassSession, "id"> & { id: string } = {
      id: realId,
      organizationId: classData.organizationId,
      disciplineId: classData.disciplineId,
      name: classData.name,
      dateTime: classData.dateTime,
      durationMinutes: classData.durationMinutes,
      instructorId: classData.instructorId ?? "",
      capacity: classData.capacity,
      registeredParticipantsIds: classData.registeredParticipantsIds || [],
      waitlistParticipantsIds: classData.waitlistParticipantsIds || [],
      status: (action === "cancel" ? "cancelled" : classData.status ?? "scheduled") as ClassSession["status"],
      notes: classData.notes,
      // No incluir isGenerated ya que ahora es una clase real
    };

    // Persistir en la base de datos
    const persistedClass = await prisma.classSession.create({
      data: classToPersist,
    });

    console.log(
      `Generated class persisted: ${classData.id} -> ${realId} (${action})`
    );

    return NextResponse.json({
      success: true,
      originalId: classData.id,
      persistedClass,
      action,
    });
  } catch (error) {
    console.error("Error persisting generated class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
