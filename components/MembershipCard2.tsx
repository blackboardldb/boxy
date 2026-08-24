"use client";

import { Calendar, AlertCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PlanStatus = "active" | "scheduled" | "inactive" | string;

interface MembershipCardProps {
  planStatus: PlanStatus;
  hasPendingRenewal: boolean;
  membershipType: string;
  classLimit: number;
  isUnlimited: boolean;
  monthlyPrice?: number | null;
  formattedPeriodStart: string;
  formattedPeriodEnd: string;
  scheduledStartFormatted?: string | null;
  currentMonthStats: { classesAttended: number };
  isLoadingStats?: boolean;
}

const STATE_CONFIG: Record<string, { label: string; style?: any }> = {
  active: {
    label: "Plan activo",
    style: { backgroundColor: "var(--mc-bg-active)", backgroundImage: "var(--mc-grad-active)" }
  },
  scheduled: {
    label: "Plan programado",
    style: { backgroundColor: "var(--mc-bg-scheduled)", backgroundImage: "var(--mc-grad-scheduled)" }
  },
  inactive: {
    label: "Último plan | Inactivo",
    style: { backgroundColor: "var(--mc-bg-inactive)", backgroundImage: "var(--mc-grad-inactive)" }
  },
};

const DEFAULT_CONFIG = { label: "Tu plan", style: { backgroundColor: "var(--mc-bg-default)", backgroundImage: "var(--mc-grad-default)" } };

export function MembershipCard2({
  planStatus,
  hasPendingRenewal,
  membershipType,
  classLimit,
  isUnlimited,
  monthlyPrice,
  formattedPeriodStart,
  formattedPeriodEnd,
  scheduledStartFormatted,
  currentMonthStats,
  isLoadingStats = false,
}: MembershipCardProps) {
  const config = STATE_CONFIG[planStatus] ?? DEFAULT_CONFIG;
  const displayLabel = hasPendingRenewal ? "Último plan | Pendiente activación" : config.label;
  const displayLabelColor = hasPendingRenewal ? "text-[var(--mc-text-title)]" : "text-[var(--mc-text-muted)]";

  const percentage = isUnlimited ? 0 : Math.min(100, (currentMonthStats.classesAttended / classLimit) * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isNaN(percentage) ? circumference : circumference - (percentage / 100) * circumference;

  return (
    <div className={`w-full p-5 rounded-xl mb-10 space-y-1 ring-1 ring-[var(--mc-ring)] overflow-hidden overflow-hidden`} style={config.style}>
      <p className={`uppercase ${displayLabelColor} text-xs font-bold tracking-widest`}>
        {displayLabel}
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h2 className="text-[var(--mc-text-title)] font-bold text-[1.4rem] uppercase ">{membershipType}</h2>
          <p className="text-[var(--mc-text-muted)] text-sm">
            {isUnlimited ? "Ilimitadas" : classLimit} clases •{" "}
            ${monthlyPrice ? monthlyPrice.toLocaleString("es-CL") : "N/A"}
          </p>
          {planStatus === "active" && !isUnlimited && (
            <p className="text-[var(--mc-text-muted)] text-xs">
              {formattedPeriodStart} → {formattedPeriodEnd}
            </p>
          )}

        </div>

        {planStatus === "active" && (
          <div className="flex flex-col items-center shrink-0">
            {isUnlimited ? (
              <div className="text-right">
                <p className="text-[var(--mc-text-title)] font-semibold text-2xl leading-none">
                  {isLoadingStats ? "—" : currentMonthStats.classesAttended}
                </p>
                <p className="text-[var(--mc-text-title)] text-[10px] uppercase tracking-wider mt-1">Consumidas</p>
              </div>
            ) : (
              <>
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" className="stroke-[var(--mc-stroke-muted)]" strokeWidth="5" fill="none" />
                    <circle
                      cx="32" cy="32" r="28"
                      className="stroke-[var(--mc-stroke)] transition-all duration-1000 ease-out"
                      strokeWidth="5" fill="none" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <p className="text-[var(--mc-text-title)] font-bold text-sm leading-none flex items-baseline">
                      <span className={isLoadingStats ? "animate-pulse" : "text-[var(--mc-text-title)]"}>
                        {isLoadingStats ? "-" : currentMonthStats.classesAttended}
                      </span>
                      <span className="text-[var(--mc-text-title)] text-[12px] font-normal ml-0.5">/{classLimit}</span>
                    </p>
                  </div>
                </div>
                <p className="text-[var(--mc-text-title)] text-[9px] uppercase tracking-wider mt-1">usadas</p>
              </>
            )}
          </div>
        )}

        {planStatus !== "active" &&
          planStatus !== "scheduled" &&
          planStatus !== "pending" &&
          !hasPendingRenewal && (
            <Link href="/alumnos/renovar-plan">
              <Button variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">
                Renovar
              </Button>
            </Link>
          )}
      </div>

      {planStatus !== "active" &&
        planStatus !== "scheduled" &&
        planStatus !== "pending" &&
        !hasPendingRenewal && (
          <div className="flex justify-between items-center border-t border-[var(--mc-ring)] pt-3">
            <div className="text-[var(--mc-text-title)] inline-flex gap-2 text-sm items-center">
              <AlertCircle size={16} />
              <p className="text-sm sm:text-base">Tu plan ya no está vigente</p>
            </div>

          </div>
        )}

      {hasPendingRenewal && (
        <div className="border-t border-[var(--mc-ring)] pt-3 mt-2">
          <p className="text-[var(--mc-text-title)] text-sm mb-2">
            Si tu plan no se activa pronto, informa a tu coach o escríbenos por WhatsApp:
            {" "} <Link href="https://wa.me/56912345678" className="font-bold underline text-[var(--mc-text-title)]" target="_blank">
              Chatear ahora
            </Link>
          </p>
        </div>
      )}

      {planStatus === "scheduled" && (
        <div className="border-t border-[var(--mc-ring)] pt-3 mt-2">
          <p className="text-[var(--mc-text-title)] text-sm">
            Tu próximo plan iniciará el <span className="font-bold">{scheduledStartFormatted ?? formattedPeriodStart}</span>.
          </p>
        </div>
      )}


    </div>
  );
}
