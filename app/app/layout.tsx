"use client";

import type React from "react";
import GlobalNav from "@/components/GlobalNav";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRenewalPage = pathname === "/app/renovar-plan";

  return (
    <>
      {!isRenewalPage && <GlobalNav />}
      {children}
    </>
  );
}
