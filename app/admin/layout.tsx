import type React from "react";
import { Navigation } from "../../components/admincomponents/navigation";
import { MobileAdminNav } from "../../components/admincomponents/mobile-nav-admin-v2";
import Logo from "@/components/Logo";
import Link from "next/link";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const role = headersList.get("x-user-role") || "alumno";

  return (
    <div className="min-h-screen bg-white flex rounded-t-2xl sm-rounded-none " style={{
      backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(182, 206, 255, 0.4), transparent 60%)`,

    }}>


      {/* ── Sidebar Desktop ── */}
      <div className="hidden lg:block w-72 h-screen p-4  sticky top-0">
        <aside className="lg:flex flex-col w-full h-full bg-white shrink-0 rounded-xl 
        overflow-hidden border border-zinc-100 shadow-xl">
          <div className="p-8 border-b border-zinc-50 text-black">
            <Link href="/admin" className="text-black">
              <Logo size={160} />
            </Link>
          </div>
          <div className="flex-1 overflow-hidden">
            <Navigation role={role} />
          </div>
        </aside>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Content — extra bottom padding so the floating nav never covers content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-14 sm:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <MobileAdminNav role={role} />
    </div>
  );
}
