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
 * Crea un usuario en Supabase Authentication con la contraseña explícita del tenant.
 * La contraseña DEBE provenir de Organization.defaultStudentPassword/defaultCoachPassword/
 * defaultAdminPassword, desencriptada con decryptPassword() antes de llamar a esta función.
 * No existe ningún fallback global — si no llega una contraseña válida, falla ruidosamente.
 *
 * @param email           Email del usuario
 * @param role            Rol en auth metadata ("alumno" | "coach" | "admin")
 * @param explicitPassword Contraseña en texto plano ya desencriptada del tenant (obligatoria)
 * @param metadata        Metadata adicional (nombre, apellido, etc.)
 * @param organizationId  ID de la organización para app_metadata
 * @returns El ID del usuario creado en auth.users
 */
export async function createAuthUser(
  email: string,
  role: "alumno" | "coach" | "admin",
  explicitPassword: string,
  metadata?: { firstName?: string; lastName?: string },
  organizationId?: string
): Promise<string> {
  if (!explicitPassword) {
    throw new Error(
      "[admin.ts] createAuthUser requiere explicitPassword — la contraseña debe venir del tenant (Organization.defaultStudentPassword/defaultCoachPassword/defaultAdminPassword), sin ningún fallback global."
    );
  }

  const supabase = createAdminClient();

  // 1. Crear usuario en auth.users con la contraseña por defecto según rol
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: explicitPassword,
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

