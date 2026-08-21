// src/components/class-list.tsx
"use client";

import { ClassCard } from "./ClassCard";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import type { FormattedClassItem } from "@/lib/types";

interface ClassListProps {
  selectedDate: Date;
  classes: FormattedClassItem[];
  onRegister: (classItem: FormattedClassItem) => void;
  onCancel: (classItem: FormattedClassItem) => void;
  className?: string;
  isLoading?: boolean;
  canRegister?: boolean;
  planStatus?:
  | "active"
  | "expired"
  | "pending"
  | "exhausted"
  | "scheduled"
  | "inactive";
}

export default function ClassList({
  selectedDate,
  classes,
  onRegister,
  onCancel,
  className = "",
  isLoading = false,
  canRegister = true,
  planStatus = "active",
}: ClassListProps) {
  // Función para formatear la fecha a un string legible
  const formatDate = (date: Date) => {
    return format(date, "EEEE dd 'de' MMMM", { locale: es });
  };

  // Remover el loader de página completa para usar skeletons por item

  // Validación de datos de entrada
  if (!classes || !Array.isArray(classes)) {
    console.error("ClassList: Datos de clases inválidos", classes);
    return (
      <div className={`${className}`}>
        <div className="p-4 text-center">
        <p className="text-alumno-text-subtle">Error: Datos de clases inválidos</p>
      </div>
      </div>
    );
  }

  // Sort classes by time
  const sortedClasses = classes.sort((a, b) => {
    const timeA = parseISO(a.dateTime);
    const timeB = parseISO(b.dateTime);
    return timeA.getTime() - timeB.getTime();
  });

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-3 text-alumno-text">
        <span className="text-xs uppercase">{formatDate(selectedDate)}</span>
        <p className="text-base uppercase font-semibold">
          {sortedClasses.length} Clases disponibles
        </p>
      </div>

      {/* Class list */}
      <div className="space-y-4">
        {sortedClasses.length > 0 ? (
          sortedClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onRegister={() => onRegister(classItem)}
              onCancel={() => onCancel(classItem)}
              canRegister={canRegister}
              planStatus={planStatus}
            />
          ))
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-alumno-chip-bg animate-pulse" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16 border border-alumno-border rounded-xl">
            <Calendar className="w-12 h-12 text-alumno-text-muted mx-auto mb-4" />
            <p className="text-alumno-text-muted text-base">
              No hay clases programadas.
            </p>
            <p className="text-alumno-text-subtle text-sm mt-2">
              Selecciona otro día en el calendario.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
