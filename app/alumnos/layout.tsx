import { requireAuth } from "@/lib/auth/require-auth";
import { getTenant } from "@/lib/tenant/get-tenant";
import { prisma } from "@/lib/prisma";

export default async function AlumnosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const { organizationId } = await getTenant();

  // Tema de la organización
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { themePrimaryColor: true, themeVariant: true, name: true },
  });

  const primaryColor = org?.themePrimaryColor ?? "#6366f1";
  const variant = org?.themeVariant ?? 1;

  return (
    <div
      data-variant={variant}
      style={{ "--color-primary": primaryColor } as React.CSSProperties}
      className="min-h-screen bg-background"
    >
      {children}
    </div>
  );
}
