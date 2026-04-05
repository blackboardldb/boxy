"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import AdminWeeklyDatePicker from "@/components/admincomponents/admin-weekly-date-picker";
import AdminClassList from "@/components/admincomponents/admin-class-list";
import AdminClassDetailDrawer from "@/components/admincomponents/admin-class-detail-drawer";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { startOfDay, format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassSession, ClassListItem, Instructor } from "@/lib/types";
import { formatDateChile, formatTimeChile } from "@/lib/utils";
import {
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
    users,
    fetchClassSessions,
    fetchUsers,
    fetchDisciplines,
    fetchInstructorsMinimal,
  } = useBlackSheepStore();

  // const { toast } = useToast(); // Deprecated and causing infinite loops

  // Estado de paginación
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;
  
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const today = startOfDay(new Date());

  // Inicializar la fecha seleccionada: usar hoy por defecto
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);
  const [selectedClass, setSelectedClass] = useState<ClassListItem | null>(
    null
  );
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("all");
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
        instructors.length === 0 ? fetchInstructorsMinimal().then(setInstructors) : Promise.resolve(),
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
    fetchInstructorsMinimal,
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
    setPage(Page => 1); // Resetear a la primera página al cambiar fecha
    setSelectedDisciplineId("all");
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

  const disciplinesInDay = useMemo(() => {
    const seen = new Set<string>();
    return activeClasses.filter(c => {
      if (seen.has(c.disciplineId)) return false;
      seen.add(c.disciplineId);
      return true;
    }).map(c => ({ id: c.disciplineId, name: c.discipline || c.name }));
  }, [activeClasses]);

  const filteredClasses = useMemo(() =>
    selectedDisciplineId === "all"
      ? activeClasses
      : activeClasses.filter(c => c.disciplineId === selectedDisciplineId)
  , [activeClasses, selectedDisciplineId]);

  // Implementar paginación correctamente
  const paginatedClasses = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredClasses.slice(startIndex, endIndex);
  }, [filteredClasses, page, limit]);

  const totalPages = Math.ceil(filteredClasses.length / limit);

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
    <div className="pb-8 space-y-6">
      <AdminWeeklyDatePicker
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Chips de filtro — solo si hay más de una disciplina */}
      {disciplinesInDay.length > 1 && (
        <div className="px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedDisciplineId("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${selectedDisciplineId === "all"
                  ? "bg-lime-500 text-black"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
            >
              Todo
            </button>
            {disciplinesInDay.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDisciplineId(d.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedDisciplineId === d.id
                    ? "bg-lime-500 text-black"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Información de resultados */}
      <div className="flex justify-between items-center px-4 md:px-8">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Cargando clases..."
            : `Mostrando ${paginatedClasses.length} de ${
                filteredClasses.length
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
          className="px-4"
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
