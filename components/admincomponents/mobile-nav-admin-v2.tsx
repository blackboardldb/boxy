"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Bell,
  ClipboardList,
  Calendar,
  CreditCard,
  GraduationCap,
  Settings,
  MoreHorizontal,
  LogOut,
  X,
} from "lucide-react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useNotificationCount } from "@/lib/hooks/useNotificationCount";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// ─── Nav items ────────────────────────────────────────────────────────────────

const primaryNavItems = [
  { name: "Dashboard", href: "/hub",          icon: LayoutDashboard, roles: ["admin", "coach"] },
  { name: "Clases",    href: "/hub/clases",    icon: ClipboardList,   roles: ["admin", "coach"] },
  { name: "Alumnos",   href: "/hub/alumnos",   icon: Users,           roles: ["admin", "coach"] },
  { name: "Alertas",   href: "/hub/alertas",   icon: Bell,            roles: ["admin", "coach"], hasDot: true },
];

const secondaryNavItems = [
  { name: "Horarios",      href: "/hub/horarios",        icon: Calendar,       roles: ["admin", "coach"] },
  { name: "Planes",        href: "/hub/planes",          icon: CreditCard,     roles: ["admin"] },
  { name: "Instructores",  href: "/hub/instructores",    icon: GraduationCap,  roles: ["admin", "coach"] },
  { name: "Finanzas",      href: "/hub/finanzas",        icon: LayoutDashboard,roles: ["admin"] },
  { name: "Configuración", href: "/hub/configuraciones", icon: Settings,       roles: ["admin"] },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileAdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const notificationCount = useNotificationCount();

  const [moreOpen, setMoreOpen]   = useState(false);

  async function handleLogout() {
    setMoreOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) =>
    href === "/hub" ? pathname === "/hub" : pathname.startsWith(href);

  const secondaryActive = secondaryNavItems.some((i) => isActive(i.href));

  const visiblePrimary = primaryNavItems.filter(
    (i) => !i.roles || (role && i.roles.includes(role))
  );
  const visibleSecondary = secondaryNavItems.filter(
    (i) => !i.roles || (role && i.roles.includes(role))
  );

  return (
    <>
      {/* ── Bottom bar ── */}
      <nav
        className="lg:hidden fixed bottom-2 inset-x-0 mx-auto z-30 flex flex-row items-center justify-around
                   w-[92dvw] sm:w-[60dvw]
                   bg-white/20 backdrop-blur-xl
                   border border-zinc-200
                   rounded-full px-2 py-1.5 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]"
        style={{ marginBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {visiblePrimary.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 min-w-[3rem]",
                active
                  ? "text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-800"
              )}
            >
              {/* Active pill background */}
              {active && (
                <span className="absolute inset-0 rounded-full bg-white/10" />
              )}

              <item.icon className={cn("h-5 w-5 relative", active && "text-zinc-900")} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium relative">{item.name}</span>

              {/* Alert dot */}
              {item.hasDot && notificationCount > 0 && (
                <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-900" />
              )}
            </Link>
          );
        })}

        {/* ── Más button ── */}
        {visibleSecondary.length > 0 && (
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 min-w-[3rem]",
              secondaryActive || moreOpen
                ? "text-zinc-900"
                : "text-zinc-600 hover:text-zinc-800"
            )}
          >
            {(secondaryActive || moreOpen) && (
              <span className="absolute inset-0 rounded-full bg-white/10" />
            )}
            <MoreHorizontal className="h-5 w-5 relative" strokeWidth={secondaryActive || moreOpen ? 2.2 : 1.7} />
            <span className="text-[10px] font-medium relative">Más</span>
          </button>
        )}
      </nav>

      {/* ── "Más" drawer ── */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="px-0 pb-0">
          <DrawerHeader className="px-6 pb-3 border-b border-zinc-100 flex items-center justify-between">
            <DrawerTitle className="text-base font-semibold text-zinc-800">Más opciones</DrawerTitle>
            <button
              onClick={() => setMoreOpen(false)}
              className="rounded-full p-1.5 hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DrawerHeader>

          <div className="px-4 py-3 grid grid-cols-3 gap-3">
            {visibleSecondary.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-2 py-4 rounded-2xl transition-all duration-150 text-center",
                    active
                      ? "bg-zinc-950 text-white shadow-md"
                      : "bg-zinc-100/70 text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-xs font-semibold leading-tight">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="px-4 pb-6 pt-1 border-t border-zinc-100 mt-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-4 py-3 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-all group"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Cerrar sesión
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
