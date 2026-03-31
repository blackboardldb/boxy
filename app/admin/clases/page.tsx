"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AdminWeeklyDatePicker from "@/components/admincomponents/admin-weekly-date-picker";
import AdminClassList from "@/components/admincomponents/admin-class-list";
import AdminClassDetailDrawer from "@/components/admincomponents/admin-class-detail-drawer";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { startOfDay, format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassSession, ClassListItem, Discipline } from "@/lib/types";
import { toDateString, toTimeString, createLocalDate, formatDateChile, formatTimeChile } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  getYear,
  getMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import type { DayOfWeek } from "@/lib/types";

// Utilidad para saber si una clase es pasada
const isClassPast = (dateTime: string | Date): boolean =>
  isPast(new Date(dateTime));

// Función simple para convertir fecha local a UTC ISO string
function localToUTC(date: Date): string {
  return new Date(date).toISOString();
}

// CONTEXTO: Este tipo se ha enriquecido para ser 100% compatible con AdminClassDetailDrawer.
// Ahora contiene toda la información necesaria para que el drawer muestre
// los detalles completos de la clase, sin necesidad de hacer otra llamada a la API.

export default function AdminClasesPage() {
  const {
    classSessions,
    disciplines,
    instructors,
    users,
    fetchClassSessions,
    fetchUsers,
    fetchDisciplines,
    fetchInstructors,
  } = useBlackSheepStore();

  // const { toast } = useToast(); // Deprecated and causing infinite loops

  // Estado de paginación
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  const today = startOfDay(new Date());

  // Inicializar la fecha seleccionada: usar hoy por defecto
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);
  const [selectedClass, setSelectedClass] = useState<ClassListItem | null>(
    null
  );
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // CONTEXTO: Función de conversión enriquecida. Busca el instructor en la lista
  // de instructores (entidad separada de usuarios/alumnos).
  const convertClassSessionToClassItem = useCallback(
    (session: ClassSession): ClassListItem => {
      const discipline = disciplines?.find(
        (d) => d.id === session.disciplineId
      );
      // Los instructorId referencian la entidad Instructor, NO la de usuarios/alumnos
      const instructor = instructors?.find((i) => i.id === session.instructorId);
      const enrolled = session.enrolledCount ?? session.registeredParticipantsIds.length;

      return {
        id: session.id,
        dateTime: session.dateTime,
        name: discipline?.name || session.name,
        instructor: instructor
          ? `${instructor.firstName} ${instructor.lastName}`
          : "Por asignar",
        duration: `${session.durationMinutes || 60} min`,
        alumnRegistred: `${enrolled}/${session.capacity || 15}`,
        isRegistered: session.isUserRegistered || false, // Relevante para la vista de alumno, no de admin.
        status: session.status,
        discipline: discipline?.name || session.name,
        disciplineId: session.disciplineId,
        date: formatDateChile(session.dateTime),
        time: formatTimeChile(session.dateTime),
        color: discipline?.color || "#666",
        capacity: session.capacity,
        enrolled: enrolled,
        registeredParticipantsIds: session.registeredParticipantsIds,
        waitlistParticipantsIds: session.waitlistParticipantsIds,
        notes: session.notes,
      };
    },
    [disciplines, instructors]
  );


  // Función para cargar un rango semanal (mejor UX y evita bucles)
  const currentWeekStartStr = useMemo(
    () => format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    [selectedDate]
  );

  const loadClassesForWeek = useCallback(async (dateInWeek: Date) => {
    setIsLoading(true);
    try {
      const start = startOfWeek(dateInWeek, { weekStartsOn: 1 });
      const end = endOfWeek(dateInWeek, { weekStartsOn: 1 });
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      console.log(`[AdminClases] Loading week range: ${startStr} to ${endStr}`);
      
      // Pedimos a la API las clases de toda la semana
      await fetchClassSessions(startStr, endStr, 1, 150);
      
      // Punto 1 matizado: Solo cargar si no existen en el store
      await Promise.all([
        users.length === 0 ? fetchUsers(1, 1000) : Promise.resolve(),
        disciplines.length === 0 ? fetchDisciplines() : Promise.resolve(),
        instructors.length === 0 ? fetchInstructors() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchClassSessions,
    fetchUsers,
    fetchDisciplines,
    fetchInstructors,
    users.length,
    disciplines.length,
    instructors.length,
  ]);

  // Cargar clases al montar y cuando cambie la semana física
  useEffect(() => {
    loadClassesForWeek(selectedDate);
  }, [currentWeekStartStr, loadClassesForWeek]);

  // Manejar cambio de fecha
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setPage(1); // Resetear a la primera página al cambiar fecha
  }, []);

  // CONTEXTO: Filtrado inteligente para optimizar performance y UX
  const activeClasses = useMemo(() => {
    return classSessions
      .filter((session: ClassSession) => {
        // Filtrar por fecha seleccionada
        const isSameDate =
          formatDateChile(session.dateTime) ===
          formatDateChile(selectedDate);

        if (!isSameDate) return false;

        // Filtrar clases canceladas
        if (session.status === "cancelled") return false;

        return true;
      })
      .map(convertClassSessionToClassItem);
  }, [classSessions, selectedDate, convertClassSessionToClassItem]);

  // Implementar paginación correctamente
  const paginatedClasses = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return activeClasses.slice(startIndex, endIndex);
  }, [activeClasses, page, limit]);

  const totalPages = Math.ceil(activeClasses.length / limit);

  const handleViewClass = (classItem: ClassListItem) => {
    setSelectedClass(classItem);
    setIsDetailDrawerOpen(true);
  };

  const handleCancelClass = async (classId: string) => {
    try {
      // Para clases reales, usar la API
      const response = await fetch(`/api/classes/${classId}/admin/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al cancelar la clase");
      }
      
      // Punto 3: Sincronización de mutaciones - Recargar la semana para ver cambios en UI
      console.log("Clase cancelada exitosamente, recargando semana...");
      await loadClassesForWeek(selectedDate);
    } catch (error) {
      console.error("Error canceling class:", error);
    }
  };

  const handleCloseDrawer = () => {
    setIsDetailDrawerOpen(false);
    setSelectedClass(null);
  };

  return (
    <div className="py-8 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gestión de Clases</h1>
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <span>Herramienta operativa para instructores</span>
        </div>
      </div>

      {/* Selector de fecha semanal */}
      <AdminWeeklyDatePicker
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Información de resultados */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Cargando clases..."
            : `Mostrando ${paginatedClasses.length} de ${
                activeClasses.length
              } clases para ${format(selectedDate, "dd/MM/yyyy")}`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Lista de clases */}
      {isLoading && activeClasses.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <AdminClassList
          classes={paginatedClasses}
          onViewClass={handleViewClass}
          onCancelClass={handleCancelClass}
        />
      )}

      {/* Drawer de detalles de clase */}
      <AdminClassDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDrawer}
        classItem={selectedClass}
        onCancelClass={handleCancelClass}
      />
    </div>
  );
}
