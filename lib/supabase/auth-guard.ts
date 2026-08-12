import { createClient } from "./server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { supabaseJWKS } from "./jwks";

interface AuthUser {
  id: string;
  email: string;
  app_metadata: Record<string, any>;
}

interface AuthSuccess {
  user: AuthUser;
  role: string;
  organizationId: string;
  dbUserId: string | null; // id de public.users — evita re-lookup por email en las rutas
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
  // BUG-ROLE-02 fix: eliminado fallback a user_metadata (editable por el cliente).
  // Fuente de verdad: app_metadata (service role only) → organization_members (DB).

  const user = {
    id:    payload.sub as string,
    email: payload.email as string,
    app_metadata,
  };

  // DAR-01: Fuente de verdad única para Superadmin = isManager (boolean).
  // La rama role === "OWNER" | "SUPPORT" fue eliminada — era código muerto
  // (create-manager.ts nunca escribe app_metadata.role; confirmado por auditoría).
  if (app_metadata.isManager === true) {
    return { user, role: "MANAGER", organizationId: "", dbUserId: null };
  }

  // A partir de acá: flujo normal de organization_members (ADMIN / COACH / ALUMNO)
  let role           = (app_metadata.role as string)?.toUpperCase() || "";
  let organizationId = app_metadata.organizationId as string;

  let dbUserId: string | null = null;

  if (!organizationId || !role) {
    // MT-08 / BUG-ROLE-02: Resolver desde organization_members si app_metadata está
    // incompleto (token recién emitido, primer login, error de escritura en app_metadata).
    // Cubre tanto organizationId como role ausentes — ambos se leen de la DB en bloque.
    const member = await prisma.organizationMember.findFirst({
      where:   { user: { authId: user.id } },
      orderBy: { joinedAt: "desc" },
      select:  { organizationId: true, role: true, userId: true },
    });

    if (!member) {
      return { error: "Sin membresía activa en ningún centro.", status: 403 };
    }

    organizationId = organizationId || member.organizationId;
    role           = role           || member.role?.toUpperCase() || "";
    dbUserId       = member.userId;
  }

  return { user, role, organizationId, dbUserId };
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

/**
 * ⚠️ SOLO para rutas GET de datos propios/org — NO usar en mutations ni /manager/*.
 *
 * Diferencia clave respecto a requireAuth():
 *   - Elimina el fallback a `prisma.organizationMember.findFirst` que ocurre cuando
 *     el JWT no trae organizationId/role (ese es el costo real en Boxy, no getUser()).
 *   - Resuelve el tenant desde el header `x-organization-id` del proxy (fuente única
 *     de verdad), nunca desde app_metadata del JWT.
 *
 * Validación de pertenencia: aunque no hace el findFirst del fallback, sí hace
 *   un findUnique por PK compuesta (userId_organizationId) para cerrar el vector
 *   de header manipulado — sin RLS de respaldo, esta es la única barrera para ese
 *   vector. Es O(1) por la PK compuesta indexada, a diferencia del findFirst eliminado
 *   que hacía JOIN en users sin saber el tenant.
 *
 * Ventana de riesgo: hasta ~1h de rol desactualizado si el usuario fue baneado o
 *   cambiado de rol (el JWT sigue siendo válido hasta que expire).
 */
export async function requireAuthFast(request: Request): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { error: "No autenticado", status: 401 };
  }

  let payload;
  try {
    const verified = await jwtVerify(session.access_token, supabaseJWKS);
    payload = verified.payload;
  } catch {
    return { error: "Token inválido o expirado", status: 401 };
  }

  const app_metadata = (payload.app_metadata as any) || {};

  // MANAGER bypass — mismo criterio que requireAuth()
  if (app_metadata.isManager === true) {
    return {
      user: { id: payload.sub as string, email: payload.email as string, app_metadata },
      role: "MANAGER",
      organizationId: "",
      dbUserId: null,
    };
  }

  // Resolver tenant exclusivamente desde el header del proxy.
  // ⚠️ Hallazgo 6: no usar app_metadata.organizationId — el proxy y el JWT
  // pueden divergir. El header es la fuente única de verdad en Boxy.
  const organizationId = (request as any).headers?.get?.("x-organization-id") ?? "";
  if (!organizationId) {
    return { error: "Tenant no resuelto — falta x-organization-id", status: 400 };
  }

  // Obtener el userId de public.users a partir del authId del JWT
  const dbUser = await prisma.user.findUnique({
    where: { authId: payload.sub as string },
    select: { id: true },
  });
  if (!dbUser) {
    return { error: "Usuario no encontrado", status: 404 };
  }

  // Validación de pertenencia: PK compuesta indexada O(1) — no es el findFirst eliminado.
  // Sin RLS de respaldo, esta query es la única barrera contra header manipulado.
  const membership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: dbUser.id, organizationId } },
    select: { role: true },
  });

  if (!membership) {
    return { error: "Sin permisos para este centro", status: 403 };
  }

  const user = {
    id: payload.sub as string,
    email: payload.email as string,
    app_metadata,
  };

  const role = membership.role?.toUpperCase() || "";

  return { user, role, organizationId, dbUserId: dbUser.id };
}

/**
 * Helper para requerir rol de administrador o coach validando ESTRICTAMENTE 
 * la pertenencia al tenant indicado en el header x-organization-id.
 * MITIGA: Tenant spoofing en mutations cross-tenant.
 * 
 * Hereda la ventana de riesgo de requireAuthFast: hasta ~1h de rol desactualizado
 * si el usuario fue baneado o degradado (sesión JWT sigue viva). Aceptado para M0.
 */
export async function requireAdminFast(request: Request): Promise<AuthResult> {
  const auth = await requireAuthFast(request);

  if ("error" in auth) {
    return auth;
  }

  if (!["ADMIN", "COACH"].includes(auth.role)) {
    return { error: "Sin permisos para este centro", status: 403 };
  }

  return auth;
}

/**
 * Helper para mutaciones y accesos de datos propios donde un ALUMNO 
 * solo puede actuar sobre sí mismo, pero un ADMIN/COACH puede actuar sobre cualquiera.
 * Usa requireAuthFast por debajo, protegiendo contra spoofing de tenant.
 */
export async function requireSelfOrAdminFast(request: Request, targetUserId: string): Promise<AuthResult> {
  const auth = await requireAuthFast(request);

  if ("error" in auth) {
    return auth;
  }

  const isAdmin = ["ADMIN", "COACH"].includes(auth.role);
  if (!isAdmin && auth.user.id !== targetUserId) {
    return { error: "Sin permisos para actuar sobre este perfil", status: 403 };
  }

  return auth;
}
