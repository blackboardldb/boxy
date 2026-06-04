import { requireAdmin } from "@/lib/auth/require-admin";
import { getTenant } from "@/lib/tenant/get-tenant";
import { prisma } from "@/lib/prisma";
import { ThemeConfig } from "@/components/theme-config";

export default async function ConfiguracionPage() {
  await requireAdmin();
  const { organizationId } = await getTenant();

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      themePrimaryColor: true,
      themeVariant: true,
    },
  });

  if (!org) return null;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎨 Apariencia del centro</h1>
        <p className="text-muted-foreground mt-1">
          Personaliza el color y estilo visual de <strong>{org.name}</strong>.
          Los cambios se aplican inmediatamente para todos los usuarios.
        </p>
      </div>

      <ThemeConfig
        organizationId={organizationId}
        initialColor={org.themePrimaryColor}
        initialVariant={org.themeVariant}
      />
    </div>
  );
}
