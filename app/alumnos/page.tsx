"use client";

import { useMemo } from "react";
import { HomePage } from "@/components/HomePage";
import Logo from "@/components/Logo";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useMyBookings } from "@/lib/react-query/hooks/useClasses";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatTimeLocal, formatWeekday, getStudentClassesInPeriod } from "@/lib/utils";
import { SkeletonHomePage } from "@/components/ui/skeleton";

export default function Page() {
  const { currentUser, isLoading: userLoading } = useCurrentUser();

  // Determinamos desde cuándo buscar clases (inicio del periodo actual, o hoy si no tiene)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const periodStartStr = currentUser?.membership?.currentPeriodStart;
  const startDateToFetch = periodStartStr
    ? (periodStartStr < todayStr ? periodStartStr : todayStr)
    : todayStr;

  // Bookings del periodo actual o futuros del alumno
  const { data: myBookings = [], isFetching: statsLoading } = useMyBookings(
    currentUser?.id,
    startDateToFetch
  );

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
          (session.isUserRegistered ?? false)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )
      .map((session) => {
        return {
          id: session.id,
          dateTime: session.dateTime,
          disciplineId: session.disciplineId,
          name: session.name,
          instructor: "Instructor",
          duration: "60 min",
          alumnRegistred: `${session.enrolledCount ?? 0}/${
            session.capacity || 15
          }`,
          isRegistered: session.isUserRegistered ?? false,
          formattedDayLabel: formatWeekday(session.dateTime),
          formattedTime: formatTimeLocal(session.dateTime),
        };
      });
  }, [myBookings, currentUser]);

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
