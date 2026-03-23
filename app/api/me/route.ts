import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Buscar por email (lowercased) en public.users
    const dbUser = await prisma.user.findFirst({
      where: { email: { equals: user.email!, mode: "insensitive" } },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dbUser });
  } catch (error) {
    console.error("[/api/me] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
