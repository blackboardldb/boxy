import { createClient } from "@/lib/supabase/server";
import { jwtVerify } from "jose";
import { supabaseJWKS } from "@/lib/supabase/jwks";
import type { MemberRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

  // BUG-ROLE-02 fix: leer exclusivamente desde app_metadata (solo escribible por service role).
  // user_metadata es editable por el cliente — nunca usarlo como fuente de autorización.
  // Nota: get-session.ts maneja el contexto de centros (MemberRole: ALUMNO/COACH/ADMIN).
  // Los managers (OWNER/SUPPORT) usan require-manager.ts con su propio flujo.
  const app_metadata = (payload.app_metadata as any) || {};

  let organizationId = app_metadata.organizationId as string | undefined;
  let role           = app_metadata.role           as MemberRole | undefined;

  // Fallback a DB: app_metadata puede estar vacío si el usuario fue creado
  // recientemente y aún no hizo login (condición de carrera entre creación y
  // escritura de app_metadata). La DB es la única fuente de verdad válida.
  if (!organizationId || !role) {
    const member = await prisma.organizationMember.findFirst({
      where:   { user: { authId: payload.sub as string } },
      orderBy: { joinedAt: "desc" },
      select:  { organizationId: true, role: true },
    });
    if (!member) return null;
    organizationId = organizationId ?? member.organizationId;
    role           = (role ?? member.role) as MemberRole;
  }

  if (!organizationId || !role) return null;

  return {
    authId: payload.sub as string,
    email:  (payload.email as string) ?? "",
    organizationId,
    role,
  };
}
