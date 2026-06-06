"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface SignInResult {
  error?: string;
}

/**
 * Server Action de login para el contexto de un tenant.
 * 1. Autentica en Supabase Auth
 * 2. Verifica membresía en el centro actual
 * 3. Escribe organizationId + role en app_metadata
 * 4. Redirige según rol
 */
export async function signIn(
  organizationId: string,
  formData: FormData
): Promise<SignInResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." };
  }

  const supabase = await createClient();

  // 1. Autenticar en Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { error: "Credenciales incorrectas." };
  }

  const authId = authData.user.id;

  // 2. Buscar el User de Boxy por authId
  const user = await prisma.user.findUnique({
    where: { authId },
    select: { id: true },
  });

  if (!user) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta no está registrada en esta plataforma." };
  }

  // 3. Verificar membresía en este centro
  const member = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId,
      },
    },
    select: { role: true, status: true },
  });

  if (!member) {
    await supabase.auth.signOut();
    return { error: "No tienes una cuenta en este centro." };
  }

  if (member.status !== "active") {
    await supabase.auth.signOut();
    return { error: "Tu cuenta en este centro está inactiva." };
  }

  // 4. Actualizar app_metadata con contexto del tenant (requiere service role)
  // Lo hacemos via API interna para no exponer service role al cliente
  try {
    await fetch(
      new URL(
        "/api/auth/update-metadata",
        process.env.NEXT_PUBLIC_SUPABASE_URL
      ).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-middleware-secret": process.env.MIDDLEWARE_SECRET ?? "",
        },
        body: JSON.stringify({
          authId,
          organizationId,
          role: member.role,
        }),
      }
    );
  } catch {
    // No bloqueamos el login si falla — el middleware leerá el rol del member en DB
    console.warn("[signIn] No se pudo actualizar app_metadata");
  }

  // 5. Redirigir según rol
  if (member.role === "ADMIN" || member.role === "COACH") {
    redirect("/hub");
  }

  redirect("/alumnos");
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
