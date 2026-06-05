import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Admin de Supabase — solo usar en el servidor (API routes, Server Actions).
 * Usa el SUPABASE_SERVICE_ROLE_KEY que bypassa RLS y permite crear usuarios en auth.users.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    
    throw new Error(
      `Faltan variables de entorno para Supabase Admin: ${missing.join(", ")}. Asegúrate de configurarlas en Vercel.`
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * HAL-12b: Contraseñas por defecto según rol — leídas de env vars sin fallback.
 * Si alguna variable falta, el servidor falla en boot con un error claro
 * en vez de correr con credenciales expuestas en el código fuente.
 *
 * Variables requeridas:
 *   DEFAULT_PASSWORD_ALUMNO   (ej: ddd)
 *   DEFAULT_PASSWORD_COACH    (ej: ddd)
 *   DEFAULT_PASSWORD_ADMIN    (ej: ddd)
 */
const alumnoPassword = process.env.DEFAULT_PASSWORD_ALUMNO;
const coachPassword  = process.env.DEFAULT_PASSWORD_COACH;
const adminPassword  = process.env.DEFAULT_PASSWORD_ADMIN;

if (!alumnoPassword || !coachPassword || !adminPassword) {
  const missing = [
    !alumnoPassword && "DEFAULT_PASSWORD_ALUMNO",
    !coachPassword  && "DEFAULT_PASSWORD_COACH",
    !adminPassword  && "DEFAULT_PASSWORD_ADMIN",
  ].filter(Boolean);
  throw new Error(
    `[admin.ts] Faltan variables de entorno requeridas: ${missing.join(", ")}. Configúralas en Vercel y en .env local.`
  );
}

const DEFAULT_PASSWORDS: Record<"alumno" | "coach" | "admin", string> = {
  alumno: alumnoPassword,
  coach:  coachPassword,
  admin:  adminPassword,
};

/**
 * Crea un usuario en Supabase Authentication con la contraseña por defecto según su rol.
 * También inserta la fila en `public.profiles` con el rol dado.
 *
 * @param email    Email del usuario
 * @param role     Rol en la tabla profiles ("alumno" | "coach" | "admin")
 * @param metadata Metadata adicional (nombre, apellido, etc.)
 * @returns El ID del usuario creado en auth.users
 */
export async function createAuthUser(
  email: string,
  role: "alumno" | "coach" | "admin",
  metadata?: { firstName?: string; lastName?: string },
  organizationId?: string
): Promise<string> {
  const supabase = createAdminClient();

  const defaultPassword = DEFAULT_PASSWORDS[role];

  // 1. Crear usuario en auth.users con la contraseña por defecto según rol
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: defaultPassword,
    email_confirm: true, // Confirmar email automáticamente (no requiere verificación)
    user_metadata: {
      firstName: metadata?.firstName ?? "",
      lastName: metadata?.lastName ?? "",
      role,
    },
  });

  if (error) {
    // Si el usuario ya existe en Auth, relanzar el error con mensaje claro
    throw new Error(`Supabase Auth error: ${error.message}`);
  }

  const authUserId = data.user.id;

  if (organizationId) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        organizationId,
        role,
      }
    });
    if (updateError) {
      console.error("[createAuthUser] Error updating app_metadata:", updateError);
    }
  }

  // 2. Insertar (o actualizar) el perfil en public.profiles
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: authUserId,
      role,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("[createAuthUser] Error creating profile:", profileError);
    // No lanzar error aquí — el usuario auth ya fue creado correctamente
    // El middleware leerá profiles pero el login fallará gracefully si falta
  }

  return authUserId;
}

/**
 * Elimina un usuario de Supabase Authentication.
 * Útil cuando se elimina un usuario del sistema (en cascada se elimina el profile).
 *
 * @param authUserId UUID del usuario en auth.users
 */
export async function deleteAuthUser(authUserId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(authUserId);
  if (error) {
    console.error("[deleteAuthUser] Error deleting auth user:", error);
    throw error;
  }
}

