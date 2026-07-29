import { requireAuth } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "../../components/admincomponents/admin-dashboard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const headersList = await headers();
  const role = headersList.get("x-user-role") || "alumno";

  let orgName = "Boxy"; // Fallback por defecto

  try {
    const auth = await requireAuth();
    if ("error" in auth) {
      redirect("/login");
    }
    
    if (auth.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: auth.organizationId },
        select: { name: true },
      });
      if (org?.name) {
        orgName = org.name;
      }
    }
  } catch (error) {
    console.error("Error obteniendo nombre de la organización:", error);
  }

  return (
    <div className="p-4 pt-8 md:p-8 ">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{orgName}</h1>
      </div>
      <AdminDashboard role={role} />
    </div>
  );
}
