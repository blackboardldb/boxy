"use client";

import { useState, useMemo, useCallback } from "react";
import AdminWeeklyDatePicker from "@/components/admincomponents/admin-weekly-date-picker";
import AdminClassList from "@/components/admincomponents/admin-class-list";
import AdminClassDetailDrawer from "@/components/admincomponents/admin-class-detail-drawer";
import { startOfDay, format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassSession, ClassListItem, Instructor } from "@/lib/types";
import { formatDateChile, formatTimeChile } from "@/lib/utils";
import { startOfWeek, endOfWeek } from "date-fns";
import type { DayOfWeek } from "@/lib/types";
import { useClasses, useCancelClass } from "@/lib/react-query/hooks/useClasses";
import { useDisciplines } from "@/lib/react-query/hooks/useDisciplines";
import { useInstructorsMinimal } from "@/lib/react-query/hooks/useInstructors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CancelDayModal } from "@/components/admincomponents/cancel-day-modal";
import { CreateClassModal } from "@/components/admincomponents/create-class-modal";

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
  // Estado UI
  const [page, setPage] = useState(1);
  const limit = 10;
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);
  const [selectedClass, setSelectedClass] = useState<ClassListItem | null>(null);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("all");
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [classToCancel, setClassToCancel] = useState<ClassListItem | null>(null);
  const [isCancelDayModalOpen, setIsCancelDayModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);

  // Semana activa
  const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

  // React Query
  const { data: classSessions = [], isFetching } = useClasses({ startDate: weekStart, endDate: weekEnd });
  const { data: disciplinesData } = useDisciplines();
  const disciplines = disciplinesData ?? [];
  const { data: instructors = [] } = useInstructorsMinimal();
  const cancelClass = useCancelClass();

  // CONTEXTO: Función de conversión enriquecida. Busca el instructor en la lista
  // de instructores (entidad separada de usuarios/alumnos).
  const convertClassSessionToClassItem = useCallback(
    (session: ClassSession): ClassListItem => {
      const discipline = disciplines?.find(
        (d) => d.id === session.disciplineId
      );
      // Los instructorId referencian la entidad Instructor, NO la de usuarios/alumnos
      const instructor = instructors?.find((i) => i.id === session.instructorId);
      const enrolled = session.enrolledCount ?? 0;

      return {
        id: session.id,
        dateTime: session.dateTime,
        name: session.name || discipline?.name || "Clase",
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
        notes: session.notes,
      };
    },
    [disciplines, instructors]
  );




  // Manejar cambio de fecha
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setPage(1);
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

  const handleCancelClass = (classId: string) => {
    // Buscar la clase en activeClasses para tener la info completa (enrolled, name, etc)
    const cls = activeClasses.find(c => c.id === classId);
    if (cls) {
      setClassToCancel(cls);
    }
  };

  const confirmCancelClass = async () => {
    if (!classToCancel) return;
    try {
      await cancelClass.mutateAsync(classToCancel.id);
      console.log("Clase cancelada exitosamente");
      setClassToCancel(null);
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

      {/* Acciones de día */}
      <div className="px-4 md:px-8 flex justify-end gap-2">
        <button 
          onClick={() => setIsCreateClassModalOpen(true)}
          className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Nueva clase
        </button>
        <button 
          onClick={() => setIsCancelDayModalOpen(true)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Cancelar clases
        </button>
      </div>

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
          {isFetching
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
      {isFetching && activeClasses.length === 0 ? (
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

      <AlertDialog open={!!classToCancel} onOpenChange={(open) => !open && setClassToCancel(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de cancelar la clase de <strong>{classToCancel?.name}</strong> con el instructor <strong>{classToCancel?.instructor}</strong>.
              <br /><br />
              <span className="text-red-600 font-medium">
                ⚠️ Hay {classToCancel?.enrolled || 0} alumno(s) inscrito(s) que se verán afectados. 
                Se les enviará una notificación y sus cupos serán devueltos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelClass}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              disabled={cancelClass.isPending}
            >
              {cancelClass.isPending ? "Cancelando..." : "Sí, cancelar clase"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CancelDayModal 
        isOpen={isCancelDayModalOpen}
        onClose={() => setIsCancelDayModalOpen(false)}
        date={selectedDate}
      />

      <CreateClassModal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
