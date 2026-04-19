import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/lib/services/class-service";
import { z } from "zod";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    const bodySchema = z.object({ userId: z.string().min(1) });
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { userId } = parsed.data;

    const result = await classService.registerStudent(classId, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || "Error al inscribir al usuario" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Inscripción exitosa",
      class: result.data,
    });
  } catch (error: any) {
    console.error("Error registering for class:", error);
    return NextResponse.json(
      { error: error?.message || "Error al inscribir al usuario" },
      { status: 500 }
    );
  }
}
