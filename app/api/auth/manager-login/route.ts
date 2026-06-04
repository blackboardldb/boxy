import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Login para ManagerUser — verifica contra Supabase Auth y la tabla manager_user.
 */
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const manager = await prisma.managerUser.findUnique({
    where: { authId: authData.user.id },
  });

  if (!manager) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "No tienes acceso al panel de manager" },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
