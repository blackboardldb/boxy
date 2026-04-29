// app/app/calendar/page.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import WeeklyDatePicker from "@/components/weekly-date-picker";
import ClassList from "@/components/class-list";
import RegistrationModal from "@/components/registration-modal";
import CancellationModal from "@/components/cancellation-modal";
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
import { ClassSession, FormattedClassItem } from "@/lib/types";
import {
  formatWeekday,
  getPlanStatus,
  canUserRegisterForClasses,
  isClassWithinPlanValidity,
  formatDateChile,
  formatTimeChile,
} from "@/lib/utils";
import { useClasses, useRegisterClass, useCancelClassRegistration } from "@/lib/react-query/hooks/useClasses";
import { useDisciplines } from "@/lib/react-query/hooks/useDisciplines";
import { useInstructorsMinimal } from "@/lib/react-query/hooks/useInstructors";

export default function CalendarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<FormattedClassItem | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  // Auth
  const { currentUser, isLoading: userLoading, reload: reloadUser } = useCurrentUser();

  // Semana activa
  const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

  // React Query
  const dayStart = format(selectedDate, "yyyy-MM-dd");
  const { data: dayClasses = [], isFetching: dayClassesLoading } = useClasses({ startDate: dayStart, endDate: dayStart });
  const { data: weekClasses = [], isFetching: weekClassesLoading } = useClasses({ startDate: weekStart, endDate: weekEnd });
  const classesLoading = dayClassesLoading;

  const classSessions = useMemo(() => {
    const map = new Map<string, ClassSession>();
    dayClasses.forEach(c => map.set(c.id, c));   // base: día actual
    weekClasses.forEach(c => map.set(c.id, c));  // sobreescribe con semana completa
    return Array.from(map.values());
  }, [dayClasses, weekClasses]);

  useEffect(() => {
    console.log('[DEBUG] dayClasses:', dayClasses.length)
    console.log('[DEBUG] weekClasses:', weekClasses.length)
    console.log('[DEBUG] classSessions merged:', classSessions.length)
  }, [dayClasses, weekClasses, classSessions])

  const { data: disciplinesData } = useDisciplines();
  const disciplines = disciplinesData ?? [];
  const { data: instructors = [] } = useInstructorsMinimal();
  const registerClass = useRegisterClass();
  const cancelRegistration = useCancelClassRegistration();

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

      const isRegistered = session.isUserRegistered ?? false;

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
        disciplineId: session.disciplineId,
        name: session.name || discipline?.name,
        instructor: instructorName,
        duration: "60 min",
        alumnRegistred: `${session.enrolledCount ?? 0}/${
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

  // Manejar cambio de fecha
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedDisciplineId("all");
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
            return session.isUserRegistered ?? false;
          }

          // Para hoy: mostrar clases no canceladas
          if (isToday) {
            if (session.status === "cancelled") return false;
            
            const now = new Date();
            const sessionDateTime = new Date(session.dateTime);
            const sessionEndTime = new Date(
              sessionDateTime.getTime() + (session.durationMinutes || 60) * 60000
            );
            
            const isFinished = now > sessionEndTime;
            const isUserRegistered = session.isUserRegistered ?? false;
            
            if (isFinished && !isUserRegistered) {
              return false;
            }
            
            return true;
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

  // Disciplinas únicas presentes en el día (para los chips)
  const disciplinesInDay = useMemo(() => {
    const seen = new Set<string>();
    return currentClasses.filter(c => {
      if (seen.has(c.disciplineId)) return false;
      seen.add(c.disciplineId);
      return true;
    }).map(c => ({ id: c.disciplineId, name: c.name }));
  }, [currentClasses]);

  // Clases a renderizar según filtro activo
  const filteredClasses = useMemo(() =>
    selectedDisciplineId === "all"
      ? currentClasses
      : currentClasses.filter(c => c.disciplineId === selectedDisciplineId)
  , [currentClasses, selectedDisciplineId]);

  const bookedClassesCount = useMemo(() => {
    return filteredClasses.filter((c) => c.isRegistered).length;
  }, [filteredClasses]);

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
      await registerClass.mutateAsync({
        classId: selectedClass.id,
        userId: currentUser.id,
      });
      reloadUser();
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error;
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

        const applicableRule = discipline.cancellationRules.find((rule: any) =>
          selectedClass.formattedTime.startsWith(rule.time)
        );

        if (applicableRule && hoursUntilClass < applicableRule.hoursBefore) {
          return;
        }
      }

      await cancelRegistration.mutateAsync({
        classId: selectedClass.id,
        userId: currentUser.id,
      });
      reloadUser();
    } catch (error) {
      console.error("Error al cancelar:", error);
      throw error;
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
        
        {/* Chips de filtro — solo si hay más de una disciplina */}
        {disciplinesInDay.length > 1 && (
          <div className="max-w-4xl mx-auto px-4 pt-4 md:px-6">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedDisciplineId("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedDisciplineId === "all"
                    ? "bg-lime-500 text-black"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
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
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
            classes={filteredClasses}
            onRegister={handleRegister}
            onCancel={handleCancel}
            className="max-w-4xl mx-auto min-h-svh pb-20 px-4 py-6 md:px-6 md:py-8"
            isLoading={dayClassesLoading || weekClassesLoading}
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
