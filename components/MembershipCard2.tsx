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

const STATE_CONFIG: Record<string, { label: string; gradient?: string; labelColor?: string; style?: any }> = {
  active: {
    label: "Plan activo", gradient: "bg-gradient-to-b from-black  to-lime-950/60", labelColor: "text-white", style: {
      backgroundColor: "rgba(2, 2, 2, 1)",
      backgroundImage: "radial-gradient(at 99.12% 6.00%, rgba(3, 47, 17, 1) 0, transparent 50%), radial-gradient(at 2.32% 88.50%, rgba(16, 77, 37, 1) 0, transparent 57%), radial-gradient(at 88.38% 113.33%, rgba(65, 101, 6, 1) 0, transparent 44%)",
    }
  },
  scheduled: {
    label: "Plan programado", gradient: "bg-gradient-to-b from-zinc-950  to-blue-950/60", labelColor: "text-white", style: {

      backgroundColor: "rgba(0, 0, 0, 1)",
      backgroundImage: "radial-gradient(at 99.12% 6.00%, rgba(11, 44, 97, 1) 0, transparent 50%), radial-gradient(at 2.32% 88.50%, rgba(10, 64, 87, 1) 0, transparent 57%), radial-gradient(at 88.38% 113.33%, rgba(12, 138, 152, 1) 0, transparent 44%)",

    }
  },
  inactive: {
    label: "Último plan | Inactivo", gradient: "bg-gradient-to-b from-zinc-950  to-orange-950/60", labelColor: "text-white", style: {
      backgroundColor: "rgba(2, 2, 2, 1)",
      backgroundImage: "radial-gradient(at 99.12% 6.00%, rgba(89, 10, 10, 1) 0, transparent 50%), radial-gradient(at 2.32% 88.50%, rgba(101, 48, 10, 1) 0, transparent 57%), radial-gradient(at 88.38% 113.33%, rgba(142, 99, 11, 1) 0, transparent 44%)",
    }
  },
};

const DEFAULT_CONFIG = { label: "Tu plan", gradient: "bg-zinc-900", labelColor: "text-white/80" };

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
  const displayLabelColor = hasPendingRenewal ? "text-black" : config.labelColor;

  const percentage = isUnlimited ? 0 : Math.min(100, (currentMonthStats.classesAttended / classLimit) * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isNaN(percentage) ? circumference : circumference - (percentage / 100) * circumference;

  return (
    <div className={`w-full p-5 rounded-xl mb-10 space-y-1 ring-1 ring-white/10 overflow-hidden overflow-hidden`} style={config.style}>
      <p className={`uppercase ${displayLabelColor} text-xs font-bold tracking-widest`}>
        {displayLabel}
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h2 className="text-white font-bold text-[1.4rem] uppercase ">{membershipType}</h2>
          <p className="text-white/80 text-sm">
            {isUnlimited ? "Ilimitadas" : classLimit} clases •{" "}
            ${monthlyPrice ? monthlyPrice.toLocaleString("es-CL") : "N/A"}
          </p>
          {planStatus === "active" && !isUnlimited && (
            <p className="text-white/80 text-xs">
              {formattedPeriodStart} → {formattedPeriodEnd}
            </p>
          )}

        </div>

        {planStatus === "active" && (
          <div className="flex flex-col items-center shrink-0">
            {isUnlimited ? (
              <div className="text-right">
                <p className="text-white font-semibold text-2xl leading-none">
                  {isLoadingStats ? "—" : currentMonthStats.classesAttended}
                </p>
                <p className="text-white text-[10px] uppercase tracking-wider mt-1">Consumidas</p>
              </div>
            ) : (
              <>
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" className="stroke-white/20" strokeWidth="5" fill="none" />
                    <circle
                      cx="32" cy="32" r="28"
                      className="stroke-white transition-all duration-1000 ease-out"
                      strokeWidth="5" fill="none" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <p className="text-white font-bold text-sm leading-none flex items-baseline">
                      <span className={isLoadingStats ? "animate-pulse" : "text-white"}>
                        {isLoadingStats ? "-" : currentMonthStats.classesAttended}
                      </span>
                      <span className="text-white text-[12px] font-normal ml-0.5">/{classLimit}</span>
                    </p>
                  </div>
                </div>
                <p className="text-white text-[9px] uppercase tracking-wider mt-1">usadas</p>
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
          <div className="flex justify-between items-center border-t border-white/20 pt-3">
            <div className="text-white inline-flex gap-2 text-sm items-center">
              <AlertCircle size={16} />
              <p className="text-sm sm:text-base">Tu plan ya no está vigente</p>
            </div>

          </div>
        )}

      {hasPendingRenewal && (
        <div className="border-t border-white/10 pt-3 mt-2">
          <p className="text-white text-sm mb-2">
            Si tu plan no se activa pronto, informa a tu coach o escríbenos por WhatsApp:
            {" "} <Link href="https://wa.me/56912345678" className="font-bold underline text-white" target="_blank">
              Chatear ahora
            </Link>
          </p>
        </div>
      )}

      {planStatus === "scheduled" && (
        <div className="border-t border-white/10 pt-3 mt-2">
          <p className="text-white text-sm">
            Tu próximo plan iniciará el <span className="font-bold">{scheduledStartFormatted ?? formattedPeriodStart}</span>.
          </p>
        </div>
      )}


    </div>
  );
}
