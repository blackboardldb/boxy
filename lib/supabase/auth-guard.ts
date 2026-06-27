import { createClient } from "./server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { supabaseJWKS } from "./jwks";

interface AuthSuccess {
  user: any;
  role: string;
  organizationId: string;
}

interface AuthError {
  error: string;
  status: number;
}

export type AuthResult = AuthSuccess | AuthError;

/**
 * Helper para requerir solo autenticación básica (cualquier usuario logueado).
 * Útil para rutas como /api/me o funcionalidades de alumno.
 *
 * Estrategia:
 *   1. supabase.auth.getSession() lee la cookie local — SIN llamada de red.
 *   2. jwtVerify() verifica la firma con JWKS de Supabase (singleton cacheado).
 *      Primera llamada: fetch del JWKS. Siguientes: verificación local en memoria.
 *   3. El fallback a DB solo ocurre si organizationId no está en el JWT.
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();

  // getSession() lee la cookie sin hacer ninguna llamada de red a Supabase Auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { error: "No autenticado", status: 401 };
  }

  let payload;
  try {
    // supabaseJWKS es un singleton cacheado — compatible con ECC P-256 y HS256 legacy
    const verified = await jwtVerify(session.access_token, supabaseJWKS);
    payload = verified.payload;
  } catch {
    return { error: "Token inválido o expirado", status: 401 };
  }

  const app_metadata = (payload.app_metadata as any) || {};
  const user_metadata = (payload.user_metadata as any) || {};

  const user = {
    id: payload.sub as string,
    email: payload.email as string,
    app_metadata,
    user_metadata,
  };

  // 1. Intentar obtener el rol y la organización de los metadatos del JWT
  let role = (app_metadata.role as string) || (user_metadata.role as string);
  let organizationId = (app_metadata.organizationId as string) || (user_metadata.organizationId as string);

  // Superadmin: no requiere organizationId
  if (role === "OWNER" || role === "SUPPORT") {
    return { user, role, organizationId: "" };
  }

  // Normalizar a mayúsculas para emparejar con los enums
  role = role?.toUpperCase() || "ALUMNO";

  if (!organizationId) {
    // MT-08: Resolver desde organization_members si no está en el token.
    const member = await prisma.organizationMember.findFirst({
      where: { user: { authId: user.id } },
      orderBy: { joinedAt: "desc" },
      select: { organizationId: true, role: true },
    });

    if (!member) {
      return { error: "Sin membresía activa en ningún centro.", status: 403 };
    }

    organizationId = member.organizationId;
    role = member.role;
  }

  return { user, role, organizationId };
}

/**
 * Helper para requerir rol de administrador o coach.
 * Útil para todas las rutas bajo /api/admin, /api/users, /api/plans, etc.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireAuth();

  if ("error" in auth) {
    return auth;
  }

  if (!["ADMIN", "COACH"].includes(auth.role)) {
    return { error: "Sin permisos", status: 403 };
  }

  return auth;
}

// Guard exclusivo para /manager
export async function requireManager(): Promise<AuthResult> {
  const auth = await requireAuth();
  if ("error" in auth) return auth;
  if (!["OWNER", "SUPPORT"].includes(auth.role)) {
    return { error: "Sin permisos", status: 403 };
  }
  return auth;
}
