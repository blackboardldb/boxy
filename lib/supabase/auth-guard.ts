import { createClient } from "./server";

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

  // 1. Intentar obtener el rol y la organización de los metadatos (rápido y evita RLS)
  let role = (user.app_metadata?.role as string) || (user.user_metadata?.role as string);
  let organizationId = (user.app_metadata?.organizationId as string) || (user.user_metadata?.organizationId as string);

  // 2. Si no hay el rol en metadatos, fallback a la tabla profiles
  if (!role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role;
  }

  // Default organization if none found (fallback to BlackSheep)
  if (!organizationId) {
    organizationId = "org_blacksheep_001";
  }

  return { user, role: role || "alumno", organizationId };
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

  if (!["admin", "coach"].includes(auth.role)) {
    return { error: "Sin permisos", status: 403 };
  }

  return auth;
}
