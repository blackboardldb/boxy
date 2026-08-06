import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { resolveInstructorForDiscipline } from "@/lib/utils/class-generator";
import { prisma } from "@/lib/prisma";
import { ClassSession } from "@/lib/types";
import { z } from "zod";

const persistGeneratedSchema = z.object({
  classData: z.object({
    id:              z.string(),
    organizationId:  z.string(), // Recibido del cliente pero ignorado — se fuerza desde sesión
    disciplineId:    z.string(),
    name:            z.string(),
    dateTime:        z.string(),
    durationMinutes: z.number(),
    instructorId:    z.string().optional(),
    capacity:        z.number(),
    status:          z.string().optional(),
    notes:           z.string().optional(),
  }),
  action: z.string().min(1, "action es requerido"),
});

/**
 * Persiste una clase generada en la base de datos.
 * Se usa cuando el admin interactúa con una clase generada (cancela, modifica, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const activeOrgId = request.headers.get("x-organization-id");
    if (!activeOrgId) {
      return NextResponse.json({ error: "Tenant no resuelto" }, { status: 400 });
    }

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

    // Validar FK cross-tenant: disciplina debe pertenecer al centro del admin.
    const discipline = await prisma.discipline.findFirst({
      where: { id: classData.disciplineId, organizationId: activeOrgId },
    });
    if (!discipline) {
      return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 });
    }

    // Validar FK cross-tenant: instructor — si viene en el payload, verificar pertenencia.
    // Si no viene, resolver con la misma lógica que by-date (eliminando el fallback
    // hardcodeado "inst_blacksheep_admin" que era un residuo de Bloque 3).
    // resolvedInstructorId siempre termina siendo string (o se retorna 404/400 antes).
    let resolvedInstructorId: string;
    if (classData.instructorId) {
      const instructor = await prisma.instructor.findFirst({
        where: { id: classData.instructorId, organizationId: activeOrgId },
      });
      if (!instructor) {
        return NextResponse.json({ error: "Instructor no encontrado" }, { status: 404 });
      }
      resolvedInstructorId = instructor.id;
    } else {
      const instructors = await prisma.instructor.findMany({
        where: { isActive: true, organizationId: activeOrgId },
      });
      const resolved = resolveInstructorForDiscipline(discipline, instructors, activeOrgId);
      if (!resolved) {
        return NextResponse.json(
          { error: "No hay instructor disponible para esta disciplina" },
          { status: 400 }
        );
      }
      resolvedInstructorId = resolved.id;
    }

    // Crear un ID real para la clase persistida
    const realId = `cls_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // organizationId forzado desde la sesión del admin — nunca del payload del cliente.
    const classToPersist = {
      id: realId,
      organizationId: activeOrgId,
      disciplineId: classData.disciplineId,
      name: classData.name,
      dateTime: classData.dateTime,
      durationMinutes: classData.durationMinutes,
      instructorId: resolvedInstructorId,
      capacity: classData.capacity,
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
