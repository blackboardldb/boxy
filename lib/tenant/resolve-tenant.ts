import { prisma } from "@/lib/prisma";
import type { Organization } from "@prisma/client";

/**
 * Resuelve el tenant a partir del slug del subdominio.
 * Usa select mínimo para mantener el middleware liviano.
 */
export async function resolveTenant(
  slug: string
): Promise<Pick<Organization, "id" | "name" | "slug" | "status" | "suspendedReason"> | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        suspendedReason: true,
      },
    });
    return org;
  } catch {
    // Si la DB no responde, dejamos pasar (degradación graciosa)
    return null;
  }
}
