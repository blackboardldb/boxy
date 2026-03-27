import { NextRequest, NextResponse } from "next/server";
import { getDataProvider } from "@/lib/data-layer/provider-factory";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { notes } = await request.json();
    const { id: classId } = await params;

    if (notes === undefined) {
      return NextResponse.json(
        { error: "Notes field is required" },
        { status: 400 }
      );
    }

    const provider = getDataProvider();

    // Get the class session via repository
    const classSession = await provider.classes.findUnique({
      where: { id: classId }
    });

    if (!classSession) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Update the class session with new notes via repository
    const updatedClassSession = await provider.classes.update(classId, { notes });

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
