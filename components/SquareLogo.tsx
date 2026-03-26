"use client";

import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useEffect } from "react";
import { Dumbbell } from "lucide-react";

export default function SquareLogo({ size = 64 }: { size?: number }) {
  const { initialOrganization, fetchOrganization } = useBlackSheepStore();

  useEffect(() => {
    if (!initialOrganization) {
      fetchOrganization();
    }
  }, [initialOrganization, fetchOrganization]);

  if (!initialOrganization) {
    return (
      <div 
        className="bg-gray-800 rounded-2xl"
        style={{ width: size, height: size }} 
      />
    );
  }

  if (initialOrganization?.branding?.logoSquareSvg) {
    return (
      <div 
        className="flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }} 
        dangerouslySetInnerHTML={{ __html: initialOrganization.branding.logoSquareSvg }} 
      />
    );
  }

  // Fallback to current hardcoded login logo style
  return (
    <div 
      className="bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30"
      style={{ width: size, height: size }}
    >
      <Dumbbell style={{ width: size / 2, height: size / 2 }} className="text-gray-950" strokeWidth={2.5} />
    </div>
  );
}
