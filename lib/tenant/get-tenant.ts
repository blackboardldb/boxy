import { headers } from "next/headers";

export interface TenantContext {
  organizationId: string;
  slug: string;
}

/**
 * Lee el contexto del tenant desde los headers inyectados por el middleware.
 * Solo disponible en Server Components y Route Handlers.
 * Lanza error si no hay tenant en el contexto (ruta no protegida por middleware).
 */
export async function getTenant(): Promise<TenantContext> {
  const headersList = await headers();
  const organizationId = headersList.get("x-organization-id");
  const slug = headersList.get("x-organization-slug");

  if (!organizationId || !slug) {
    throw new Error(
      "[getTenant] No hay tenant en el contexto. ¿Olvidaste agregar la ruta al matcher del middleware?"
    );
  }

  return { organizationId, slug };
}

/**
 * Versión que retorna null si no hay tenant (para rutas opcionales).
 */
export async function getTenantOrNull(): Promise<TenantContext | null> {
  try {
    return await getTenant();
  } catch {
    return null;
  }
}
