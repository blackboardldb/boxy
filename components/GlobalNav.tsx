"use client";

import { usePathname } from "next/navigation";
import { House, Calendar, CircleUser, CalculatorIcon, Dumbbell } from "lucide-react";
import React from "react";
import Link from "next/link";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  extraClass?: string;
};

export default function GlobalNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/alumnos") return pathname === "/alumnos";
    return pathname.startsWith(path);
  };

  const getLinkClass = (path: string, extraClass = "") =>
    [
      isActive(path)
        ? "text-[var(--alumno-primary)] bg-[color-mix(in_srgb,var(--alumno-primary)_10%,transparent)] rounded-2xl py-2"
        : "text-alumno-text hover:bg-alumno-surface-md rounded-xl py-2",
      "transition-all duration-200 flex flex-col items-center justify-center",
      extraClass,
    ].join(" ");

  const navItems: NavItem[] = [
    {
      href: "/alumnos",
      icon: <House className="w-6 h-6 " />,
      label: "Inicio",
      extraClass: "w-14 h-auto",
    },
    {
      href: "/alumnos/calendar",
      icon: <Calendar className="w-6 h-6 " />,
      label: "Clases",
      extraClass: "w-14 h-auto",
    },
    {
      href: "/alumnos/rutinas",
      icon: <Dumbbell className="w-6 h-6 " />,
      label: "Rutinas",
      extraClass: "w-14 h-auto",
    },
    {
      href: "/alumnos/recursos",
      icon: <CalculatorIcon className="w-6 h-6 " />,
      label: "Recursos",
      extraClass: "w-14 h-auto",
    },
    {
      href: "/alumnos/profile",
      icon: <CircleUser className="w-6 h-6 " />,
      label: "Perfil",
      extraClass: "w-14 h-auto",
    },
  ];

  return (
    <nav className="fixed p-2.5 border border-alumno-border bottom-2 inset-x-0 mx-auto rounded-full flex flex-row justify-around w-[90dvw] sm:w-[60dvw] bg-alumno-surface backdrop-blur-xl text-center z-30" style={{ marginBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {navItems.map(({ href, icon, label, extraClass }) => (
        <Link key={href} href={href} prefetch={false} className={getLinkClass(href, extraClass)}>
          {icon}
          <span className="text-xs">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
