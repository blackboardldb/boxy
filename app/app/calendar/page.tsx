// app/app/calendar/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import WeeklyDatePicker from "@/components/weekly-date-picker";
import ClassList from "@/components/class-list";
import RegistrationModal from "@/components/registration-modal";
import CancellationModal from "@/components/cancellation-modal";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import {
  startOfDay,
  isSameDay,
  parseISO,
  format,
  isBefore,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassSession } from "@/lib/types";
import {
  formatWeekday,
  getPlanStatus,
  canUserRegisterForClasses,
  isClassWithinPlanValidity,
  formatDateChile,
  formatTimeChile,
} from "@/lib/utils";

interface FormattedClassItem {
  id: string;
  dateTime: string;
  name: string;
  instructor: string;
  duration: string;
  alumnRegistred: string;
  isRegistered: boolean;
  formattedDayLabel: string;
  formattedTime: string;
  status?: string;
  isWithinPlanDates: boolean;
}

export default function CalendarPage() {
  const {
    classSessions,
    disciplines,
    fetchInstructorsMinimal,
    fetchDisciplines,
    fetchClassSessions,
    fetchMyBookings,
  } = useBlackSheepStore();

  // Estado de paginación y loading
  const [isLoading, setIsLoading] = useState(true);
  const today = startOfDay(new Date());


  // Inicializar la fecha seleccionada: usar hoy por defecto
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<FormattedClassItem | null>(
    null
  );
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Obtener el usuario autenticado real
  const { currentUser, isLoading: userLoading, reload: reloadUser } = useCurrentUser();

  // Verificar el estado del plan del usuario
  const planStatus = useMemo(() => {
    if (!currentUser) return "expired";
    return getPlanStatus(currentUser);
  }, [currentUser]);

  const canRegisterForClasses = useMemo(() => {
    if (!currentUser) return false;
    return canUserRegisterForClasses(currentUser);
  }, [currentUser]);

  // Función centralizada de conversión de datos - MEJORADA para manejar estados
  const convertClassSessionToFormattedItem = useCallback(
    (session: ClassSession): FormattedClassItem => {
      if (!currentUser) return {} as FormattedClassItem; // Fallback
      const instructor = instructors?.find(
        (inst) => inst.id === session.instructorId
      );
      const discipline = disciplines?.find(
        (d) => d.id === session.disciplineId
      );
      const instructorName = instructor
        ? `${instructor.firstName} ${instructor.lastName}`
        : "Por asignar";

      const isRegistered = session.isUserRegistered ?? session.registeredParticipantsIds.includes(
        currentUser.id
      );

      // Determinar el estado final considerando la hora actual
      let finalStatus = session.status || "scheduled";
      const now = new Date();
      const sessionDateTime = new Date(session.dateTime);
      const sessionEndTime = new Date(
        sessionDateTime.getTime() + (session.durationMinutes || 60) * 60000
      );

      // Lógica de estado en tiempo real
      if (session.status === "scheduled") {
        if (now > sessionEndTime) {
          finalStatus = "completed";
        } else if (now >= sessionDateTime && now <= sessionEndTime) {
          finalStatus = "in_progress";
        }
      }

      return {
        id: session.id,
        dateTime: session.dateTime,
        name: discipline?.name || session.name,
        instructor: instructorName,
        duration: "60 min",
        alumnRegistred: `${session.enrolledCount ?? session.registeredParticipantsIds.length}/${
          session.capacity || 15
        }`,
        isRegistered,
        formattedDayLabel: formatWeekday(session.dateTime),
        formattedTime: formatTimeChile(session.dateTime),
        status: finalStatus,
        isWithinPlanDates: isClassWithinPlanValidity(currentUser, session.dateTime),
      };
    },
    [instructors, disciplines, currentUser]
  );

  // Función para cargar un rango semanal (mejor UX)
  const currentWeekStart = useMemo(() => format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd"), [selectedDate]);

  const loadClassesForWeek = useCallback(async (dateInWeek: Date) => {
    try {
      setIsLoading(true);
      if (instructors.length === 0) {
        const data = await fetchInstructorsMinimal();
        setInstructors(data);
      }
      if (!disciplines || disciplines.length === 0) await fetchDisciplines();
      
      const start = startOfWeek(dateInWeek, { weekStartsOn: 1 });
      const end = endOfWeek(dateInWeek, { weekStartsOn: 1 });
      
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");
      
      console.log(`[Calendar] Prefetching week: ${startStr} to ${endStr}`);
      await fetchClassSessions(startStr, endStr, 1, 150);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    instructors.length,
    disciplines?.length,
    fetchInstructorsMinimal,
    fetchDisciplines,
    fetchClassSessions,
  ]);

  // Solo recargar si cambiamos de semana física o refresh manual
  useEffect(() => {
    loadClassesForWeek(selectedDate);
  }, [currentWeekStart, loadClassesForWeek, refreshTrigger]);

  // Manejar cambio de fecha
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Transformar clases para la fecha seleccionada
  const getClassesForDate = useCallback(
    (date: Date): FormattedClassItem[] => {
      if (!currentUser) return [];
      const isPastDate = isBefore(date, today);
      const isToday = isSameDay(date, today);

      // Determinar disciplinas permitidas
      const allowedDisciplines = (() => {
        if (!currentUser.membership) return null;
        const { disciplineAccess, allowedDisciplines: userAllowedDisciplines } =
          currentUser.membership.planConfig;
        
        if (disciplineAccess === "limited" && userAllowedDisciplines) {
          return userAllowedDisciplines;
        }
        return "all";
      })();

      return classSessions
        .filter((session) => {
        const isSameDate = formatDateChile(session.dateTime) === formatDateChile(date);
        if (!isSameDate) return false;

          // Filtrar por disciplinas permitidas
          if (allowedDisciplines !== "all" && allowedDisciplines !== null) {
            if (!allowedDisciplines.includes(session.disciplineId)) return false;
          }

          // Lógica para días pasados: mostrar solo clases inscritas
          if (isPastDate) {
            return (session as any).isUserRegistered || session.registeredParticipantsIds.includes(currentUser.id);
          }

          // Para hoy: mostrar clases no canceladas
          if (isToday) {
            return session.status !== "cancelled";
          }

          // Para futuro: mostrar clases programadas
          return session.status === "scheduled";
        })
        .sort((a, b) => {
          const timeA = parseISO(a.dateTime);
          const timeB = parseISO(b.dateTime);
          return timeA.getTime() - timeB.getTime();
        })
        .map(convertClassSessionToFormattedItem);
    },
    [classSessions, convertClassSessionToFormattedItem, currentUser, today]
  );

  const currentClasses = getClassesForDate(selectedDate);
  const bookedClassesCount = useMemo(() => {
    return currentClasses.filter((c) => c.isRegistered).length;
  }, [currentClasses]);

  const handleRegister = (classItem: FormattedClassItem) => {
    if (!currentUser) {
      return;
    }

    // Verificar el estado del plan antes de permitir el registro
    const planStatus = getPlanStatus(currentUser);

    if (planStatus === "inactive") {
      return;
    }

    if (planStatus === "pending") {
      return;
    }

    if (!canUserRegisterForClasses(currentUser)) {
      return;
    }

    setSelectedClass(classItem);
    setIsRegistrationModalOpen(true);
  };

  const handleCancel = (classItem: FormattedClassItem) => {
    setSelectedClass(classItem);
    setIsCancellationModalOpen(true);
  };

  const confirmRegistration = async () => {
    if (!selectedClass || !currentUser) return;

    try {
      const classId = selectedClass.id;

      // Registrar al usuario en la clase
      const response = await fetch(`/api/classes/${classId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (response.ok) {
        // Refrescar las clases y usuario para mostrar el cambio
        setRefreshTrigger((prev) => prev + 1);
        reloadUser();
        // Sincronizar clases del usuario para el contexto del home
        fetchMyBookings(currentUser.id, currentUser.membership?.currentPeriodStart);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrarse en la clase");
      }
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error; // Re-lanzar para que el modal no muestre éxito
    }
  };

  const confirmCancellation = async () => {
    if (!selectedClass || !currentUser) return;

    try {
      // Verificar reglas de cancelación
      const discipline = disciplines?.find(
        (d) => selectedClass.name === d.name || selectedClass.id.includes(d.id)
      );

      if (discipline?.cancellationRules) {
        const classDateTime = new Date(selectedClass.dateTime);
        const now = new Date();
        const hoursUntilClass =
          (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Buscar regla aplicable para esta hora específica
        const applicableRule = discipline.cancellationRules.find((rule: any) =>
          selectedClass.formattedTime.startsWith(rule.time)
        );

        if (applicableRule && hoursUntilClass < applicableRule.hoursBefore) {
          return;
        }
      }

      // Cancelar la inscripción usando la API
      const response = await fetch(`/api/classes/${selectedClass.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (response.ok) {
        // Refrescar las clases y usuario para mostrar el cambio
        setRefreshTrigger((prev) => prev + 1);
        reloadUser();
        // Sincronizar clases del usuario para el contexto del home
        fetchMyBookings(currentUser.id, currentUser.membership?.currentPeriodStart);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar la inscripción");
      }
    } catch (error) {
      console.error("Error al cancelar:", error);
      throw error; // Re-lanzar para que el modal no muestre éxito
    }
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setSelectedClass(null);
  };

  const closeCancellationModal = () => {
    setIsCancellationModalOpen(false);
    setSelectedClass(null);
  };

  return (
    <>
      <div className="max-w-full mx-auto px-4 sm:px-6 pt-2 sm:pt-8 bg-white">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 pb-3 hidden sm:block">
          Reserva de clases
        </h1>
        </div>
      </div>
        <div className=" sticky top-0 z-10 max-w-full mx-auto px-4 sm:px-6 pt-1 bg-white">
          <WeeklyDatePicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            className=""
          />
          </div>

      <div className="bg-black min-h-screen pb-28">
        {/* Plan Status Banner - Only show if not loading user data */}
        {!userLoading && planStatus !== "active" && (
          <div className="max-w-4xl mx-auto px-4 py-3 md:px-6">
            {planStatus === "pending" ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-200 text-sm font-medium mb-1">
                  Plan pendiente de validación
                </p>
                <p className="text-yellow-300 text-xs">
                  Pronto podrás reservar tus clases. Tu plan está siendo
                  validado por nuestro equipo.
                </p>
              </div>
            ) : planStatus === "scheduled" ? (
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 mb-4">
                <p className="text-blue-200 text-sm font-medium mb-1">
                  Plan Programado
                </p>
                <p className="text-blue-300 text-xs">
                  Tu plan aún no comienza. Puedes reservar clases que ocurran
                  dentro del periodo de tu plan.
                </p>
              </div>
            ) : (
              <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3 mb-4">
                <p className="text-orange-200 text-sm font-medium mb-1">
                  🟠 Plan ya no está vigente 
                </p>
                <p className="text-orange-300 text-xs">
                  Renueva tu plan para poder agendar clases.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mostrar clases solo si el plan está activo o scheduled */}
        {(planStatus === "active" || planStatus === "scheduled") && (
          <ClassList
            selectedDate={selectedDate}
            classes={currentClasses}
            onRegister={handleRegister}
            onCancel={handleCancel}
            className="max-w-4xl mx-auto min-h-svh pb-20 px-4 py-6 md:px-6 md:py-8"
            isLoading={isLoading}
            canRegister={canRegisterForClasses}
            planStatus={planStatus}
          />
        )}
      </div>

      {/* Modales solo si puede interactuar */}
      {(planStatus === "active" || planStatus === "scheduled") && (
        <>
          <RegistrationModal
            isOpen={isRegistrationModalOpen}
            onClose={closeRegistrationModal}
            classItem={selectedClass}
            onConfirm={confirmRegistration}
            isLimitReached={bookedClassesCount >= 2}
          />
          <CancellationModal
            isOpen={isCancellationModalOpen}
            onClose={closeCancellationModal}
            classItem={selectedClass}
            onConfirm={confirmCancellation}
          />
        </>
      )}
    </>
  );
}
