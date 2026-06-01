import Logo from "@/components/Logo";
import { AdminDashboard } from "../../components/admincomponents/admin-dashboard";
import { headers } from "next/headers";

export default async function AdminPage() {
  const headersList = await headers();
  const role = headersList.get("x-user-role") || "alumno";

  return (
    <div className="p-4 pt-8 md:p-8 ">
      <div className="my-8">
        <Logo size={200} className="block lg:hidden" />
        <h1 className="text-3xl font-bold hidden lg:block">BlackSheep</h1>
      </div>
      <AdminDashboard role={role} />
    </div>
  );
}
