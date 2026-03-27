import { createClient } from "./server";

interface AuthSuccess {
  user: any;
  role: string;
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

  // Obtenemos el perfil para tener el rol disponible incluso en auth básica
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { user, role: profile?.role || "alumno" };
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
