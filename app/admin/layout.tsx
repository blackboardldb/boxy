"use client";

import type React from "react";
import { useState } from "react";
import { Navigation } from "../../components/admincomponents/navigation";
import Logo from "@/components/Logo";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
          <Logo />
        </div>
        <div className="flex-1 overflow-hidden">
          <Navigation />
        </div>
      </aside>

      {/* Sidebar Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Mobile Content */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen w-80 bg-white dark:bg-slate-900 z-50 lg:hidden transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-8 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
          <Logo />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <Navigation />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Trigger) */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <Logo size={120} />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
