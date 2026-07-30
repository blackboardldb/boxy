import { prisma } from "@/lib/prisma";
import type { AuthResult } from "@/lib/supabase/auth-guard";

/**
 * resolveInternalUser — Convierte el authId de Supabase al registro interno de public.users.
 *
 * Problema que resuelve:
 *   requireAuth() devuelve `auth.user.id` que corresponde a `public.users.authId`,
 *   NO a `public.users.id`. Pasar el primero directamente a Prisma/classService
 *   retorna "Usuario no encontrado" para el 100% de los alumnos.
 *
 * Uso:
 *   const auth = await requireAuth();
 *   if ("error" in auth) { ... }
 *   const internalUser = await resolveInternalUser(auth);
 *   if (!internalUser) return NextResponse.json({ error: "..." }, { status: 404 });
 *   // → internalUser.id es el id interno correcto para Prisma y classService
 */
export async function resolveInternalUser(
  auth: Extract<AuthResult, { user: unknown }>
) {
  return prisma.user.findUnique({
    where: { authId: auth.user.id },
  });
}
