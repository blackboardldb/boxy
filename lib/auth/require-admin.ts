import { redirect } from "next/navigation";
import { getSession } from "./get-session";

/**
 * Guard para rutas de administración del centro (ADMIN y COACH).
 * Redirige a /alumnos si el usuario es alumno, a /login si no hay sesión.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "ADMIN" && session.role !== "COACH") {
    redirect("/alumnos");
  }
  return session;
}
