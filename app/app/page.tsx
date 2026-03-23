"use client";

import { useEffect, useMemo } from "react";
import { HomePage } from "@/components/HomePage";
import Logo from "@/components/Logo";
import BannerCarousel from "@/components/banner-carousel";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatTimeLocal, formatWeekday } from "@/lib/utils";
import { SkeletonHomePage } from "@/components/ui/skeleton";

export default function Page() {
  const { currentUser, isLoading: userLoading } = useCurrentUser();

  const { classSessions, instructors, fetchClassSessions, fetchInstructors } =
    useBlackSheepStore();

  // Cargar clases e instructores una sola vez
  useEffect(() => {
    if (!classSessions || classSessions.length === 0) fetchClassSessions();
    if (!instructors || instructors.length === 0) fetchInstructors();
  }, [classSessions, instructors, fetchClassSessions, fetchInstructors]);

  // Clases próximas inscritas del usuario actual
  const registeredClasses = useMemo(() => {
    if (!currentUser || !classSessions || classSessions.length === 0) return [];

    return classSessions
      .filter((session) => {
        const sessionDate = new Date(session.dateTime);
        const now = new Date();
        return (
          sessionDate >= now &&
          session.registeredParticipantsIds.includes(currentUser.id)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )
      .slice(0, 3)
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

  // Mostrar skeleton mientras carga el usuario
  if (userLoading || !currentUser) {
    return <SkeletonHomePage />;
  }

  // Datos del plan
  const membershipType =
    currentUser.membership?.membershipType || "Sin Plan";
  const monthlyPrice = currentUser.membership?.monthlyPrice ?? 0;

  const currentMonthStats = currentUser.membership?.centerStats?.currentMonth || {
    classesContracted: 0,
    classesAttended: 0,
    noShows: 0,
    remainingClasses: 0,
    lastMinuteCancellations: 0,
  };

  const progressPercentage =
    currentMonthStats.classesContracted > 0
      ? (currentMonthStats.classesAttended /
          currentMonthStats.classesContracted) *
        100
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
      <div className="p-4 max-w-4xl mx-auto text-white">
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
      <aside className="p-4 max-w-4xl mx-auto pb-28 w-full">
        <div className="w-full bg-zinc-800 p-4 rounded-lg space-y-3">
          <BannerCarousel />
        </div>
      </aside>
    </main>
  );
}
