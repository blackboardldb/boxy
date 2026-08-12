import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { z } from "zod";

const notesSchema = z.object({
  notes: z.string(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const activeOrgId = auth.organizationId;

    const { id: classId } = await params;

    const parsed = notesSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { notes } = parsed.data;

    // Scoped por organizationId: evita editar una clase de otro centro
    // aunque el id sea adivinado/válido en otro tenant.
    const classSession = await prisma.classSession.findFirst({
      where: { id: classId, organizationId: activeOrgId },
    });

    if (!classSession) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const updatedClassSession = await prisma.classSession.update({
      where: { id: classId },
      data: { notes },
    });

    return NextResponse.json({
      message: "Notas actualizadas exitosamente",
      class: updatedClassSession,
    });
  } catch (error) {
    console.error("Error updating class notes:", error);
    return NextResponse.json(
      { error: "Error al actualizar las notas" },
      { status: 500 }
    );
  }
}
