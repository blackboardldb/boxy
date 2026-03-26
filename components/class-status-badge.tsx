"use client";

import type { ClassSession } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { parseISO, addMinutes, isAfter } from "date-fns";

interface ClassStatusBadgeProps {
  classItem: {
    status?: string | null;
    dateTime: string;
    durationMinutes?: number;
  };
}

export function ClassStatusBadge({ classItem }: ClassStatusBadgeProps) {
  const now = new Date();

  // Estados específicos
  if (classItem.status === "cancelled") {
    return <Badge variant="destructive">Cancelada</Badge>;
  }

  if (classItem.status === "completed") {
    return <Badge variant="outline">Finalizada</Badge>;
  }

  if (classItem.status === "in_progress") {
    return (
      <Badge variant="default" className="bg-green-600 text-white">
        En curso
      </Badge>
    );
  }

  // Verificar si la clase ya finalizó (para clases scheduled)
  if (classItem.status === "scheduled") {
    const start = parseISO(classItem.dateTime);
    const duration = classItem.durationMinutes || 60;
    const end = addMinutes(start, duration);

    if (isAfter(now, end)) {
      return <Badge variant="outline">Finalizada</Badge>;
    }
  }

  // No mostrar badge para clases normales (scheduled) que aún no han finalizado
  return null;
}
