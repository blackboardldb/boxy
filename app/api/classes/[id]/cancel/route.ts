import { NextRequest, NextResponse } from "next/server";
import { ClassService } from "@/lib/services/class-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await request.json();
    const { id: classId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const classService = new ClassService();
    const result = await classService.cancelRegistration(classId, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || "Error al cancelar la inscripción" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Cancelación exitosa",
      class: result.data,
    });
  } catch (error: any) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: error?.message || "Error al cancelar la inscripción" },
      { status: 500 }
    );
  }
}
