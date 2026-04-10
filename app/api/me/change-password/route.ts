import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/schemas";

/**
 * POST /api/me/change-password
 * Permite al usuario autenticado cambiar su propia contraseña.
 * Body: { currentPassword?: string, newPassword: string }
 * 
 * Supabase valida que el usuario tenga sesión activa → se usa el cliente de servidor
 * con las cookies de sesión. supabase.auth.updateUser actualiza solo al usuario actual.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = changePasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { newPassword } = parsed.data;

    const supabase = await createClient();

    // Verificar que hay sesión activa
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json(
        { success: false, error: "No hay sesión activa." },
        { status: 401 }
      );
    }

    // Actualizar contraseña del usuario actual
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/me/change-password]", error);
    return NextResponse.json(
      { success: false, error: "Error inesperado." },
      { status: 500 }
    );
  }
}
