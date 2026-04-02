"use client";

import { useEffect, useMemo, useState } from "react";
import { HomePage } from "@/components/HomePage";
import Logo from "@/components/Logo";

import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatTimeLocal, formatWeekday, getStudentClassesInPeriod } from "@/lib/utils";
import { SkeletonHomePage } from "@/components/ui/skeleton";

export default function Page() {
  const { currentUser, isLoading: userLoading } = useCurrentUser();

  const { myBookings, fetchMyBookings, fetchInstructorsMinimal, isLoading: statsLoading } =
    useBlackSheepStore();
  const [instructors, setInstructors] = useState<any[]>([]);

  // Cargar clases e instructores una sola vez al montar si no hay datos
  useEffect(() => {
    if (currentUser) {
      // Usamos myBookings para separar el contexto del alumno del calendario global
      if (!myBookings || myBookings.length === 0) {
        fetchMyBookings(
          currentUser.id, 
          currentUser.membership?.currentPeriodStart
        );
      }
      if (!instructors || instructors.length === 0) {
        fetchInstructorsMinimal().then(setInstructors);
      }
    }
    // Solo dependemos de currentUser y las funciones de fetch. 
  }, [currentUser, fetchMyBookings, fetchInstructorsMinimal]);

  // Clases próximas inscritas del usuario actual
  const registeredClasses = useMemo(() => {
    if (!currentUser || !myBookings || myBookings.length === 0) return [];

    return myBookings
      .filter((session) => {
        const sessionDate = new Date(session.dateTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return (
          sessionDate >= today &&
          (session.isUserRegistered ?? session.registeredParticipantsIds.includes(currentUser.id))
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )
      .map((session) => {
        const instructor = instructors?.find(
          (inst) => inst.id === session.instructorId
        );
        const instructorName = instructor
          ? `${instructor.firstName} ${instructor.lastName}`
          : "Instructor";

        return {
          id: session.id,
          dateTime: session.dateTime,
          name: session.name,
          instructor: instructorName,
          duration: "60 min",
          alumnRegistred: `${session.enrolledCount ?? session.registeredParticipantsIds.length}/${
            session.capacity || 15
          }`,
          isRegistered: session.isUserRegistered ?? session.registeredParticipantsIds.includes(
            currentUser.id
          ),
          formattedDayLabel: formatWeekday(session.dateTime),
          formattedTime: formatTimeLocal(session.dateTime),
        };
      });
  }, [myBookings, instructors, currentUser]);

  // Membresía y stats
  const studentAllEnrolledClasses = useMemo(() => {
    return getStudentClassesInPeriod(
      myBookings, 
      currentUser?.membership?.currentPeriodStart, 
      currentUser?.membership?.currentPeriodEnd
    );
  }, [myBookings, currentUser]);

  // Mostrar skeleton mientras carga el usuario
  if (userLoading || !currentUser) {
    return <SkeletonHomePage />;
  }

  // Datos del plan
  const membershipType = currentUser.membership?.membershipType || "Sin Plan";
  const monthlyPrice = currentUser.membership?.monthlyPrice ?? 0;

  const planClassLimit = currentUser.membership?.planConfig?.classLimit ?? 0;
  
  const classesConsumedTotal = studentAllEnrolledClasses.length;
  const classesConsumed = planClassLimit > 0
    ? classesConsumedTotal
    : (currentUser.membership?.centerStats?.currentMonth?.classesAttended ?? classesConsumedTotal);

  const remainingClasses = planClassLimit > 0 ? Math.max(0, planClassLimit - classesConsumed) : 0;

  const currentMonthStats = {
    ...(currentUser.membership?.centerStats?.currentMonth || {
      noShows: 0,
      lastMinuteCancellations: 0,
    }),
    classesContracted: planClassLimit,
    classesAttended: classesConsumed,
    remainingClasses,
  };

const progressPercentage =
  planClassLimit > 0
    ? (classesConsumed / planClassLimit) * 100
    : 0;

  const formattedPeriodStart = currentUser.membership?.currentPeriodStart
    ? format(
        parseISO(currentUser.membership.currentPeriodStart.substring(0, 10)),
        "dd 'de' MMMM",
        { locale: es }
      )
    : "—";

  const formattedPeriodEnd = currentUser.membership?.currentPeriodEnd
    ? format(
        parseISO(currentUser.membership.currentPeriodEnd.substring(0, 10)),
        "dd 'de' MMMM",
        { locale: es }
      )
    : "—";

  return (
    <main className="min-h-screen bg-black">
      <div className="pb-4 px-4 pt-10 max-w-4xl mx-auto text-white">
        <Logo />
      </div>
      <HomePage
        userProfile={currentUser}
        membershipType={membershipType}
        monthlyPrice={monthlyPrice}
        currentMonthStats={currentMonthStats}
        progressPercentage={progressPercentage}
        formattedPeriodStart={formattedPeriodStart}
        formattedPeriodEnd={formattedPeriodEnd}
        registeredClasses={registeredClasses}
        isLoadingStats={statsLoading}
      />

    </main>
  );
}
