"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  Bell,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotificationCount } from "@/lib/hooks/useNotificationCount";

const navigationItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "coach"] },
  { name: "Clases", href: "/admin/clases", icon: ClipboardList, roles: ["admin", "coach"] },
  { name: "Alumnos", href: "/admin/alumnos", icon: Users, roles: ["admin", "coach"] },
  { name: "Alertas", href: "/admin/alertas", icon: Bell, roles: ["admin", "coach"], hasDot: true },
  { name: "Horarios", href: "/admin/horarios", icon: Calendar, roles: ["admin", "coach"] },
  { name: "Planes", href: "/admin/planes", icon: CreditCard, roles: ["admin"] },
  { name: "Instructores", href: "/admin/instructores", icon: GraduationCap, roles: ["admin", "coach"] },
  { name: "Finanzas", href: "/admin/finanzas", icon: LayoutDashboard, roles: ["admin"] },
  { name: "Configuración", href: "/admin/configuraciones", icon: Settings, roles: ["admin"] },
];

export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();
  const notificationCount = useNotificationCount();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Obtener rol de los metadatos (rápido y evita RLS)
        let userRole = (user.app_metadata?.role as string) || (user.user_metadata?.role as string);

        // 2. Fallback a la tabla profiles si no hay en metadatos
        if (!userRole) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          userRole = profile?.role;
        }

        setRole(userRole || "alumno");
      }
    }
    getProfile();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    if (onNavigate) onNavigate();
    router.push("/login");
  }

  const isActive = (href: string) => pathname === href;

  const filteredNavigation = navigationItems.filter(item => 
    !item.roles || (role && item.roles.includes(role))
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
        {filteredNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => {
              if (onNavigate) onNavigate();
            }}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all relative group",
              isActive(item.href)
                ? "bg-zinc-950 text-white shadow-md"
                : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/80"
            )}
          >
            <item.icon className={cn(
              "mr-4 h-5 w-5 transition-transform group-hover:scale-110",
              isActive(item.href) ? "" : "text-zinc-400"
            )} />
            {item.name}
            {item.hasDot && notificationCount > 0 && (
              <span className="absolute right-4 block h-2 w-2 rounded-sm bg-red-500 ring-2 ring-white group-hover:animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-all group"
        >
          <LogOut className="mr-4 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
