import Logo from "@/components/Logo";
import { AdminDashboard } from "../../components/admincomponents/admin-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.app_metadata?.role as string) || (user?.user_metadata?.role as string) || "user";

  return (
    <div className="p-4 pt-8 md:p-8">
      <div className="my-8">
         <Logo size={200} className="block lg:hidden" />
        <h1 className="text-3xl font-bold hidden lg:block">BlackSheep</h1>
      </div>
      <AdminDashboard role={role} />
    </div>
  );
}
