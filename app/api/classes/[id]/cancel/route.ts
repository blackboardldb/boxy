import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/lib/services/class-service";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { resolveInternalUser } from "@/lib/services/resolve-internal-user";
import { z } from "zod";


const cancelRegistrationSchema = z.object({
  userId: z.string().min(1, "userId es requerido"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Fix: Un alumno debe poder cancelar su propia inscripción, no requiere ser Admin.
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const internalUser = await resolveInternalUser(auth);
    if (!internalUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id: classId } = await params;

    const parsed = cancelRegistrationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { userId } = parsed.data;

    // Validación de seguridad crítica: el usuario solo puede cancelar su propia reserva
    if (internalUser.id !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para cancelar la reserva de otro usuario" },
        { status: 403 }
      );
    }

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
