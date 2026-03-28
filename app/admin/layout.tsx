"use client";

import type React from "react";
import { useState } from "react";
import { Navigation } from "../../components/admincomponents/navigation";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800/50">
           <Link href="/admin">
            <Logo size={160} />
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <Navigation />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header with Drawer Navigation */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <Link href="/admin">
            <Logo size={140} />
          </Link>
          <Drawer open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <DrawerTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] px-0">
              <DrawerHeader className="px-6 border-b border-slate-50 dark:border-slate-800/50 pb-4">
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
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

    </div>
  );
}
