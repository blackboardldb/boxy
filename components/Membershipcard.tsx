"use client";
 
import { Calendar, AlertCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
 
// ─── Tipos ────────────────────────────────────────────────────────────────────
 
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
 
// ─── Config por estado: label, gradiente y color del label ───────────────────
 
const STATE_CONFIG: Record<string, { label: string; gradient: string; labelColor: string }> = {
  active:    { label: "Plan activo",         gradient: "bg-gradient-to-b from-zinc-950  to-lime-950/60",   labelColor: "text-lime-400"   },
  scheduled: { label: "Plan programado",     gradient: "bg-gradient-to-b from-zinc-950  to-blue-950/60",   labelColor: "text-blue-400"   },
  inactive:  { label: "Último plan | Inactivo",        gradient: "bg-gradient-to-b from-zinc-950  to-orange-950/60", labelColor: "text-orange-400" },
};
 
// Fallback para estados no mapeados
const DEFAULT_CONFIG = { label: "Tu plan", gradient: "bg-zinc-900", labelColor: "text-white/80" };
 
// ─── Componente ───────────────────────────────────────────────────────────────
 
export function MembershipCard({
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
  // hasPendingRenewal sobreescribe el label pero no el gradiente base
  const config = STATE_CONFIG[planStatus] ?? DEFAULT_CONFIG;
  const displayLabel      = hasPendingRenewal ? "Último plan | Pendiente activación" : config.label;
  const displayLabelColor = hasPendingRenewal ? "text-orange-400"        : config.labelColor;
 
  return (
    <div className={`w-full ${config.gradient} p-4 rounded-lg mb-10 space-y-3 border border-zinc-900/50`}>
 
      {/* Label dinámico — reemplaza el <p> que estaba fuera del card */}
      <p className={`uppercase ${displayLabelColor} text-xs font-semibold tracking-widest`}>
        {displayLabel}
      </p>
 
      {/* Cabecera: nombre/precio izq · contador der (solo active) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">{membershipType}</h2>
          <p className="text-white/80 text-sm">
            {isUnlimited ? "Ilimitadas" : classLimit} clases •{" "}
            ${monthlyPrice ? monthlyPrice.toLocaleString("es-CL") : "N/A"}
          </p>
        </div>
 
        {/* Contador solo en active */}
        {planStatus === "active" && (
          <div className="text-right shrink-0">
          
            <p className="text-white font-semibold text-xl leading-none">
              <span className={`text-lime-400 ${isLoadingStats ? "animate-pulse" : ""}`}>
                {isLoadingStats ? "—" : currentMonthStats.classesAttended}
              </span>
              {!isUnlimited && (
                <span className="text-white/40 text-xl font-normal"> / {classLimit}</span>
              )}
            </p>
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">
              Consumidas
            </p>
          </div>
        )}
      </div>
 
      {/* Barra de progreso + fechas — solo active y no unlimited */}
      {planStatus === "active" && !isUnlimited && (
        <div className=" pt-3">
          <div className="w-full bg-zinc-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-lime-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, (currentMonthStats.classesAttended / classLimit) * 100)}%` }}
            />
          </div>
          {/* Fechas explícitas debajo de la barra */}
          <div className="flex justify-between mt-2">
            <span className="text-white/40 text-xs">Desde {formattedPeriodStart}</span>
            <span className="text-white/40 text-xs">Hasta {formattedPeriodEnd}</span>
          </div>
        </div>
      )}
 
      {/* Banner: renovación en revisión — overlay sob1re cualquier estado base */}
      {hasPendingRenewal && (
        <div className="border-t border-white/10 pt-3 pb-1">
           <p className="text-white/80 text-sm mb-2">
            Si tu plan no se activa pronto, informa a tu coach o escríbenos por WhatsApp:    
             {" "} <Link href="https://wa.me/56912345678" className=" font-bold underline text-white" target="_blank" >
             
                Chatear ahora

            </Link>
            </p>
        
        
        </div>
      )}
 
      {/* Banner: scheduled */}
      {planStatus === "scheduled" && (
        <div className="border-t border-white/10 pt-3 space-y-3">
            <p className="text-blue-100 text-sm mb-2">
              Tu próximo plan iniciará el <span className="font-bold">{scheduledStartFormatted ?? formattedPeriodStart}</span>.
            </p>
        </div>
      )}
 
 
      {/* Banner: inactive/vencido — solo si no hay renovación pendiente */}
      {planStatus !== "active" &&
        planStatus !== "scheduled" &&
        planStatus !== "pending" &&
        !hasPendingRenewal && (
          <div className="flex justify-between items-center border-t border-white/10 pt-3">
            <div className="text-orange-300 inline-flex gap-2 text-sm items-center">
              <AlertCircle size={16} />
              <p className="text-sm sm:text-base">Tu plan ya no está vigente</p>
            </div>
            <Link href="/app/renovar-plan">
              <Button variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">
                Renovar
              </Button>
            </Link>
          </div>
        )}
 
      {/* Footer con fechas — solo active 
      {planStatus === "active" && (
        <div className="flex justify-between items-center border-t border-white/10 pt-3">
          <div className="text-zinc-200 inline-flex gap-2 text-sm items-center">
            <Ticket size={16} />
            <p className="sm:text-sm">
              Inició el {formattedPeriodStart} hasta el {formattedPeriodEnd}
            </p>
          </div>
        </div>
      )}
 */}
    </div>
  );
}