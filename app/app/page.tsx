"use client";

import { useEffect, useMemo } from "react";
import { HomePage } from "@/components/HomePage";
import Logo from "@/components/Logo";

import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatTimeLocal, formatWeekday } from "@/lib/utils";
import { SkeletonHomePage } from "@/components/ui/skeleton";

export default function Page() {
  const { currentUser, isLoading: userLoading } = useCurrentUser();

  const { classSessions, instructors, fetchUserClasses, fetchInstructors } =
    useBlackSheepStore();

  // Cargar clases e instructores una sola vez
  useEffect(() => {
    if (currentUser && (!classSessions || classSessions.length === 0)) {
      // Fetch only classes registered to this specific student
      fetchUserClasses(currentUser.id);
    }
    if (!instructors || instructors.length === 0) fetchInstructors();
  }, [classSessions, instructors, fetchUserClasses, fetchInstructors, currentUser]);

  // Clases próximas inscritas del usuario actual
  const registeredClasses = useMemo(() => {
    if (!currentUser || !classSessions || classSessions.length === 0) return [];

    return classSessions
      .filter((session) => {
        const sessionDate = new Date(session.dateTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return (
          sessionDate >= today &&
          session.registeredParticipantsIds.includes(currentUser.id)
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
          alumnRegistred: `${session.registeredParticipantsIds.length}/${
            session.capacity || 15
          }`,
          isRegistered: session.registeredParticipantsIds.includes(
            currentUser.id
          ),
          formattedDayLabel: formatWeekday(session.dateTime),
          formattedTime: formatTimeLocal(session.dateTime),
        };
      });
  }, [classSessions, instructors, currentUser]);

  // Membresía y stats
  const studentAllEnrolledClasses = useMemo(() => {
    if (!currentUser?.membership?.currentPeriodStart || !currentUser?.membership?.currentPeriodEnd) return [];
    
    const start = new Date(currentUser.membership.currentPeriodStart);
    // Forzar término de periodo al final del día
    const endStr = currentUser.membership.currentPeriodEnd;
    const end = new Date((typeof endStr === 'string' ? endStr.substring(0, 10) : (endStr as any).toISOString().substring(0, 10)) + "T23:59:59");

    return (classSessions || [])
      .filter(s => {
        const sessionDate = new Date(s.dateTime);
        return (
          sessionDate >= start &&
          sessionDate <= end
        );
      });
  }, [classSessions, currentUser]);

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
        new Date(currentUser.membership.currentPeriodStart),
        "dd 'de' MMMM",
        { locale: es }
      )
    : "—";

  const formattedPeriodEnd = currentUser.membership?.currentPeriodEnd
    ? format(
        new Date(currentUser.membership.currentPeriodEnd),
        "dd 'de' MMMM",
        { locale: es }
      )
    : "—";

  return (
    <main className="min-h-screen bg-black">
      <div className="p-4 pt-10 max-w-4xl mx-auto text-white">
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
      />

    </main>
  );
}
