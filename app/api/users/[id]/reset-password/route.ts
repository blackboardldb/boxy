import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

/**
 * POST /api/users/[id]/reset-password
 * Permite al admin resetear la contraseña de un alumno a "blacksheep26".
 * Usa la Admin API de Supabase con el Service Role Key.
 * Recibe el email del usuario para buscar su auth_id.
 * Body: { email: string }
 */

const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const parsed = resetPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { email } = parsed.data;

    const supabase = createAdminClient();

    // Buscar el usuario en auth por email
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json(
        { success: false, error: listError.message },
        { status: 500 }
      );
    }

    const authUser = listData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado en el sistema de autenticación." },
        { status: 404 }
      );
    }

    // Resetear contraseña a blacksheep26
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: "blacksheep26" }
    );

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Contraseña de ${email} reseteada a blacksheep26`,
    });
  } catch (error) {
    console.error("[POST /api/users/[id]/reset-password]", error);
    return NextResponse.json(
      { success: false, error: "Error inesperado." },
      { status: 500 }
    );
  }
}
