"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WhatsAppLinkProps {
  phone?: string | null;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * WhatsAppLink - Componente para abrir un link directo a WhatsApp.
 * - Solo renderiza si phone tiene al menos 11 dígitos (56 + 9 dígitos).
 * - wa.me/569XXXXXXXXX
 */
export function WhatsAppLink({
  phone,
  label,
  className,
  showIcon = true
}: WhatsAppLinkProps) {
  // Solo se muestra si tiene un número válido de al menos 11 dígitos (56 + 9 dígitos).
  // Si phone es null, undefined o una cadena menor a 11 dígitos, no renderiza nada.
  if (!phone || phone.replace(/\D/g, "").length < 11) return null;

  const cleanPhone = phone.replace(/\D/g, "");

  return (
    <Link
      href={`https://wa.me/${cleanPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 transition-all text-emerald-600 hover:text-emerald-500 hover:scale-105 active:scale-95 group",
        className
      )}
      title="Contactar por WhatsApp"
    >
      {showIcon && (
        <MessageCircle className="w-4 h-4 fill-emerald-600/10" strokeWidth={2.2} />
      )}
      {label && <span className="text-sm font-semibold">{label}</span>}
    </Link>
  );
}
