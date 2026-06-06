import { createClient } from "./server";
import { prisma } from "@/lib/prisma";

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
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "No autenticado", status: 401 };
  }

  // 1. Intentar obtener el rol y la organización de los metadatos
  let role = (user.app_metadata?.role as string) || (user.user_metadata?.role as string);
  let organizationId = (user.app_metadata?.organizationId as string) || (user.user_metadata?.organizationId as string);

  // Superadmin: no requiere organizationId
  if (role === "OWNER" || role === "SUPPORT") {
    return { user, role, organizationId: "" };
  }

  // Normalizar a mayúsculas para emparejar con los enums
  role = role?.toUpperCase() || "ALUMNO";

  if (!organizationId) {
    // Resolver desde organization_members si no está en el token
    const member = await prisma.organizationMember.findFirst({
      where: { user: { authId: user.id } },
      select: { organizationId: true, role: true }
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
