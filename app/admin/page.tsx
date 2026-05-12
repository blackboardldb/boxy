import Logo from "@/components/Logo";
import { AdminDashboard } from "../../components/admincomponents/admin-dashboard";
import { requireAuth } from "@/lib/supabase/auth-guard";

// El layout ya llama requireAuth() para proteger la ruta.
// Reutilizamos la misma llamada en lugar de volver a hacer getUser() (evita RTT duplicado a Supabase).
export default async function AdminPage() {
  const auth = await requireAuth();
  const role = "role" in auth ? auth.role : "alumno";

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
