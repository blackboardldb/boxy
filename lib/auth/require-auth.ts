import { redirect } from "next/navigation";
import { getSession } from "./get-session";

/**
 * Guard para cualquier ruta autenticada.
 * Redirige a /login si no hay sesión activa.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
