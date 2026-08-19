import { requireAuth } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "../../components/admincomponents/admin-dashboard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CenterLogo } from "@/components/CenterLogo";
import Link from "next/link";

export default async function AdminPage() {
  const headersList = await headers();
  const role = headersList.get("x-user-role") || "alumno";

  const auth = await requireAuth();
  if ("error" in auth) {
    redirect("/login");
  }

  let orgName = "Boxy";
  let customIconUrl: string | null = null;
  try {
    if (auth.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: auth.organizationId },
        select: { name: true, customIconUrl: true },
      });
      if (org?.name) {
        orgName = org.name;
      }
      if (org?.customIconUrl) {
        customIconUrl = org.customIconUrl;
      }
    }
  } catch (error) {
    console.error("Error obteniendo nombre de la organización:", error);
  }

  return (
    <div className="p-4 pt-8 md:p-8 ">
      <div className="mb-4">
        {/* Logo en versión móvil */}
        <div className="block lg:hidden">
          <Link href="/hub">
            <div className="flex justify-start">
              <div className="p-1 rounded-full flex gap-2 pr-3">
                <CenterLogo iconUrl={customIconUrl} />
                <p className="font-bold text-sm tracking-wider uppercase self-center text-black">
                  {orgName || "Centro"}
                </p>
              </div>
            </div>
          </Link>
        </div>
        {/* Título en versión desktop */}
        <h1 className="hidden lg:block text-3xl font-bold">{orgName}</h1>
      </div>
      <AdminDashboard role={role} />
    </div>
  );
}
