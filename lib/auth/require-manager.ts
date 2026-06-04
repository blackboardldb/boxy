import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface ManagerContext {
  authId: string;
  email: string;
  role: "OWNER" | "SUPPORT";
}

/**
 * Guard para las rutas /manager.
 * Verifica que el usuario exista en la tabla ManagerUser.
 * Redirige a /manager/login si no está autenticado o no es manager.
 */
export async function requireManager(): Promise<ManagerContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/manager/login");
  }

  const manager = await prisma.managerUser.findUnique({
    where: { authId: user.id },
    select: { role: true, email: true },
  });

  if (!manager) {
    redirect("/manager/login");
  }

  return {
    authId: user.id,
    email: manager.email,
    role: manager.role as "OWNER" | "SUPPORT",
  };
}
