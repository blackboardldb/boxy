import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/lib/services/class-service";
import { requireAuthFast } from "@/lib/supabase/auth-guard";
import { resolveInternalUser } from "@/lib/services/resolve-internal-user";
import { ErrorHandler } from "@/lib/errors/handler";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const internalUser = await resolveInternalUser(auth);
    if (!internalUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id: classId } = await params;

    const result = await classService.registerStudent(classId, internalUser.id);

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
    return ErrorHandler.createResponse(error, {
      operation: "register_student_api",
      resource: "classes",
    });
  }
}

