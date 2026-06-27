import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { jwtVerify } from "jose";
import { supabaseJWKS } from "@/lib/supabase/jwks";
import { prisma } from "@/lib/prisma";

export interface ManagerContext {
  authId: string;
  email: string;
  role: "OWNER" | "SUPPORT";
}

/**
 * Guard para las rutas /manager.
 * 1. supabase.auth.getSession() lee la cookie local — SIN llamada de red.
 * 2. jwtVerify() verifica la firma con JWKS de Supabase (singleton cacheado).
 *    Primera llamada: fetch del JWKS. Siguientes: verificación local en memoria.
 * 3. Confirma que el authId existe en manager_users (autorización real, 1 query a tu DB).
 * Redirige a /manager/login si no está autenticado o no es manager.
 */
export async function requireManager(): Promise<ManagerContext> {
  const supabase = await createClient();

  // getSession() lee la cookie sin hacer ninguna llamada de red a Supabase Auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/manager/login");
  }

  let authId: string;
  try {
    // supabaseJWKS es un singleton cacheado — compatible con ECC P-256 y HS256 legacy
    const { payload } = await jwtVerify(session.access_token, supabaseJWKS);
    authId = payload.sub as string;
  } catch {
    redirect("/manager/login");
  }

  // Verificar en DB que el usuario es un manager válido (autorización)
  const manager = await prisma.managerUser.findUnique({
    where: { authId },
    select: { role: true, email: true },
  });

  if (!manager) {
    redirect("/manager/login");
  }

  return {
    authId,
    email: manager.email,
    role: manager.role as "OWNER" | "SUPPORT",
  };
}
