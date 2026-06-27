import { createClient } from "@/lib/supabase/server";
import { jwtVerify } from "jose";
import { supabaseJWKS } from "@/lib/supabase/jwks";
import type { MemberRole } from "@prisma/client";

export interface SessionContext {
  authId: string;
  email: string;
  organizationId: string;
  role: MemberRole;
}

/**
 * Retorna la sesión actual con el contexto del tenant.
 * Lee el organizationId y role desde app_metadata (escrito en el login).
 * Retorna null si no hay sesión activa o es inválida.
 *
 * Estrategia:
 *   1. supabase.auth.getSession() lee la cookie local — SIN llamada de red.
 *   2. jwtVerify() verifica la firma con JWKS de Supabase (singleton cacheado).
 *      Primera llamada: fetch del JWKS. Siguientes: verificación local en memoria.
 */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient();

  // getSession() lee la cookie sin hacer ninguna llamada de red a Supabase Auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return null;

  let payload;
  try {
    // supabaseJWKS es un singleton cacheado — compatible con ECC P-256 y HS256 legacy
    const verified = await jwtVerify(session.access_token, supabaseJWKS);
    payload = verified.payload;
  } catch {
    return null;
  }

  const app_metadata = (payload.app_metadata as any) || {};
  const user_metadata = (payload.user_metadata as any) || {};

  const organizationId = (app_metadata.organizationId || user_metadata.organizationId) as string | undefined;
  const role = (app_metadata.role || user_metadata.role) as MemberRole | undefined;

  if (!organizationId || !role) return null;

  return {
    authId: payload.sub as string,
    email: (payload.email as string) ?? "",
    organizationId,
    role,
  };
}
