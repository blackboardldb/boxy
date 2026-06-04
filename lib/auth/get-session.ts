import { createClient } from "@/lib/supabase/server";
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
 * Retorna null si no hay sesión activa.
 */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const organizationId = user.app_metadata?.organizationId as
    | string
    | undefined;
  const role = user.app_metadata?.role as MemberRole | undefined;

  if (!organizationId || !role) return null;

  return {
    authId: user.id,
    email: user.email ?? "",
    organizationId,
    role,
  };
}
