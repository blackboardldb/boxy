"use client";
import type React from "react";
import { useState } from "react";
import { Navigation } from "../../components/admincomponents/navigation";
import { MobileAdminNav } from "../../components/admincomponents/mobile-nav-admin-v2";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 flex ">
      {/* ── Sidebar Desktop ── */}
      <aside className="hidden lg:flex flex-col w-72 h-screen border-r border-zinc-100 bg-white shrink-0">
        <div className="p-8 border-b border-zinc-50 text-black">
          <Link href="/admin" className="text-black">
            <Logo size={160} />
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <Navigation />
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Mobile Header (hamburger — kept as fallback/logo bar)
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-100 sticky top-0 z-30">
          <Link href="/admin">
            <Logo size={140} />
          </Link>

         
          <Drawer open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-zinc-100"
              >
                <Menu className="h-6 w-6 text-zinc-700" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] px-0">
              <DrawerHeader className="px-6 border-b border-zinc-50 pb-4">
                <div className="flex items-center justify-between">
                  <DrawerTitle>
                    <Logo size={120} />
                  </DrawerTitle>
                </div>
              </DrawerHeader>
              <div className="flex-1 overflow-hidden">
                <Navigation onNavigate={() => setIsSidebarOpen(false)} />
              </div>
            </DrawerContent>
          </Drawer>
        </header> */}
        {/* Content — extra bottom padding so the floating nav never covers content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/50 custom-scrollbar p-4 pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <MobileAdminNav />
    </div>
  );
}



