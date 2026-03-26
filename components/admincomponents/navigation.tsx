"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  Bell,
  ClipboardList,
} from "lucide-react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "coach"] },
  { name: "Alumnos", href: "/admin/alumnos", icon: Users, roles: ["admin", "coach"] },
  { name: "Instructores", href: "/admin/instructores", icon: GraduationCap, roles: ["admin", "coach"] },
  { name: "Clases", href: "/admin/clases", icon: ClipboardList, roles: ["admin", "coach"] },
  { name: "Notificaciones", href: "/admin/alertas", icon: Bell, roles: ["admin", "coach"] },
  { name: "Horarios", href: "/admin/horarios", icon: Calendar, roles: ["admin", "coach"] },
  { name: "Planes", href: "/admin/planes", icon: CreditCard, roles: ["admin"] },
  { name: "Finanzas", href: "/admin/finanzas", icon: LayoutDashboard, roles: ["admin"] },
];

export function Navigation() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || "user");
      }
    }
    getProfile();
  }, [supabase]);

  const isActive = (href: string) => pathname === href;

  const filteredNavigation = navigation.filter(item => 
    !item.roles || (role && item.roles.includes(role))
  );

  return (
    <>
      <nav className="space-y-1 p-4 hidden sm:block">
        {filteredNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
      <nav className="fixed p-2.5 border border-white/10 bottom-2 inset-x-0 mx-0.5 max-w-[98dvw] rounded-full flex flex-row justify-around bg-white backdrop-blur-xl text-center z-30 sm:hidden overflow-x-auto">
        {filteredNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-2 text-[10px] font-medium rounded-md transition-colors min-w-[60px]",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="mb-1 h-4 w-4" />
            <span className="truncate w-full">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
