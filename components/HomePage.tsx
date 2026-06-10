// src/components/HomePage.tsx
"use client";

import type React from "react";
import { ClassesHomeCard } from "@/components/ClassesHomeCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { InAppAlerts } from "@/components/InAppAlerts";
import { BirthdayGreeting } from "@/components/BirthdayGreeting";
import { MotivationalHome } from "@/components/motivational-home";
import Link from "next/link";
import type { FitCenterUserProfile, FormattedClassItem } from "@/lib/types";
import { getPlanStatus } from "@/lib/utils";
import { MembershipCard } from "./Membershipcard";
import { MembershipCard2 } from "./MembershipCard2";

interface HomePageProps {
  userProfile: FitCenterUserProfile;
  membershipType: string;
  monthlyPrice?: number | null;
  currentMonthStats: {
    classesAttended: number;
    classesContracted: number;
    remainingClasses?: number;
    noShows?: number;
    lastMinuteCancellations?: number;
  };
  progressPercentage: number;
  formattedPeriodStart: string;
  formattedPeriodEnd: string;
  registeredClasses: FormattedClassItem[];
  isLoadingStats?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({
  userProfile,
  membershipType,
  monthlyPrice,
  currentMonthStats,
  formattedPeriodStart,
  formattedPeriodEnd,
  registeredClasses,
  isLoadingStats = false,
}) => {
  // Determinar el estado real del plan
  const planStatus = getPlanStatus(userProfile);

  // Derivar el límite real desde planConfig (respeta el override)
  const classLimit = userProfile.membership?.planConfig?.classLimit ?? currentMonthStats.classesContracted;
  const isUnlimited = classLimit === 0;

  const hasPendingRenewal = userProfile?.membershipRenewals?.some(
    (r: any) => r.status === 'pending'
  );

  // Si el plan está inactivo pero hay una renovación programada, mostrarlo como scheduled.
  // Override solo visual — getPlanStatus() no se modifica.
  const scheduledRenewal = userProfile?.membershipRenewals?.find(
    (r: any) => r.status === 'scheduled'
  ) ?? null;
  const hasScheduledRenewal = !!scheduledRenewal;
  const effectivePlanStatus = planStatus === 'inactive' && hasScheduledRenewal ? 'scheduled' : planStatus;

  // Fecha de inicio del plan programado — viene del renewal, NO del plan viejo.
  // Solo se usa cuando effectivePlanStatus === 'scheduled' via override.
  const scheduledStartFormatted: string | null = (() => {
    if (!scheduledRenewal) return null;
    const details = scheduledRenewal.renewalDetails as { startDate?: string } | null;
    const raw = details?.startDate;
    if (!raw) return null;
    try {
      const { format: fmt, parseISO: pISO } = require('date-fns');
      const { es: esLocale } = require('date-fns/locale');
      return fmt(pISO(raw.substring(0, 10)), "dd 'de' MMMM", { locale: esLocale });
    } catch { return raw; }
  })();

  return (
    <main className="max-w-4xl mx-auto pb-28 px-4">
      <InAppAlerts />
      <BirthdayGreeting userProfile={userProfile} />
      <div className="text-left mt-4 mb-4">
        <span className="uppercase text-white/80 text-sm font-bold">
          Hola, {userProfile.firstName}
        </span>
        <MotivationalHome />
      </div>


      <MembershipCard
        planStatus={effectivePlanStatus}
        hasPendingRenewal={!!hasPendingRenewal}
        membershipType={membershipType}
        classLimit={classLimit}
        isUnlimited={isUnlimited}
        monthlyPrice={monthlyPrice}
        formattedPeriodStart={formattedPeriodStart}
        formattedPeriodEnd={formattedPeriodEnd}
        scheduledStartFormatted={scheduledStartFormatted}
        currentMonthStats={currentMonthStats}
        isLoadingStats={isLoadingStats}
      />
      <MembershipCard2
        planStatus={effectivePlanStatus}
        hasPendingRenewal={!!hasPendingRenewal}
        membershipType={membershipType}
        classLimit={classLimit}
        isUnlimited={isUnlimited}
        monthlyPrice={monthlyPrice}
        formattedPeriodStart={formattedPeriodStart}
        formattedPeriodEnd={formattedPeriodEnd}
        scheduledStartFormatted={scheduledStartFormatted}
        currentMonthStats={currentMonthStats}
        isLoadingStats={isLoadingStats}
      />

      <div className="flex justify-between items-center mb-2">
        <p className=" uppercase text-white/80 text-xs">Clases inscritas</p>
        {planStatus === "active" ? (
          <Link href="/alumnos/calendar">
            <Button
              variant="link"
              className="text-lime-400 text-sm font-semibold px-0"
            >
              Gestionar clases
            </Button>
          </Link>
        ) : planStatus === "pending" || hasPendingRenewal ? (
          <span className="text-yellow-400 text-sm font-semibold">
            por validar
          </span>
        ) : (
          <Link href="/alumnos/renovar-plan">
            <Button
              variant="link"
              className="text-orange-400 text-sm font-semibold px-0"
            >
              Renovar plan
            </Button>
          </Link>
        )}
      </div>

      <div className="w-full bg-white/5 p-4 pt-2 rounded-xl divide-y divide-zinc-700">
        {registeredClasses.length > 0 && planStatus === "active" ? (
          <ClassesHomeCard classes={registeredClasses} />
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            {planStatus === "active" ? (
              <p className="text-zinc-500 text-base">
                Aún no te has inscrito en una clase.
              </p>
            ) : planStatus === "pending" || hasPendingRenewal ? (
              <div className="space-y-2">
                <p className="text-zinc-400 text-base font-medium">
                  Pronto podrás reservar tus clases
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-orange-400 text-base font-medium">
                  Pronto podrás reservar clases
                </p>
                <p className="text-zinc-400 text-sm">
                  Renueva tu plan para continuar entrenando
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export { HomePage };
