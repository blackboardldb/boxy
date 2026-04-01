"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneInputCLProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * PhoneInputCL - Input especializado para teléfonos chilenos.
 * - Muestra un prefijo fijo +56.
 * - Solo permite el ingreso de 9 dígitos numéricos (comenzando por 9).
 * - El valor interno guardado en la base de datos es el formato completo: 569XXXXXXXX (11 dígitos).
 */
export function PhoneInputCL({
  value,
  onChange,
  id,
  className,
  disabled
}: PhoneInputCLProps) {
  // El valor guardado es 56912345678. Mostramos solo desde el 56 en adelante si existe.
  // Pero lo que el usuario digita son los 9 dígitos después del +56.
  const displayValue = value.startsWith("56") ? value.slice(2) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números
    const rawValue = e.target.value.replace(/\D/g, "");
    
    // Limitar a 9 dígitos (formato: 9 XXXX XXXX)
    const limitedValue = rawValue.slice(0, 9);
    
    // Si hay valor, guardamos con el prefijo 56. Si está vacío, guardamos vacío.
    const finalValue = limitedValue ? `56${limitedValue}` : "";
    
    onChange(finalValue);
  };

  return (
    <div className={cn("relative flex items-center group", className)}>
      <div className="absolute left-3 flex items-center pointer-events-none transition-colors group-focus-within:text-lime-600">
        <span className="text-sm font-semibold text-zinc-500 pr-2 border-r border-zinc-200">
          +56
        </span>
      </div>
      <Input
        id={id}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder="9 1234 5678"
        className="pl-14 bg-white border-zinc-200 text-black rounded-xl focus:ring-lime-500 focus:border-lime-500 transition-all font-medium"
      />
    </div>
  );
}
