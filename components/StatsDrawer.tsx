// components/StatsDrawer.tsx
"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUserStats } from "@/lib/hooks/useUserStats";
import type { Achievement, PeriodHistory } from "@/app/api/users/[id]/stats/route";

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatsDrawerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-8">
      {/* Sección 1 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="animate-pulse bg-white/10 rounded-xl h-20" />
        <div className="animate-pulse bg-white/10 rounded-xl h-20" />
      </div>
      {/* Sección 2 */}
      <div className="animate-pulse bg-white/10 rounded-xl h-14" />
      {/* Sección 3 */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white/10 rounded-xl h-20" />
        ))}
      </div>
      {/* Sección 4 */}
      <div className="animate-pulse bg-white/10 rounded-xl h-40" />
    </div>
  );
}

// ─── Sección 1 — Números principales ─────────────────────────────────────────

function NumberCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
      <span className="text-4xl font-bold text-white leading-none">{value}</span>
      <span className="text-xs text-zinc-400 text-center">{label}</span>
    </div>
  );
}

// ─── Sección 3 — Badge de logro ───────────────────────────────────────────────

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const { achieved, emoji, label, hint } = achievement;
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-center ${achieved ? "bg-white/10" : "bg-white/5"
        }`}
    >
      <span
        className={`text-2xl leading-none ${achieved ? "opacity-100" : "opacity-25"
          }`}
      >
        {emoji}
      </span>
      <span
        className={`text-xs font-medium leading-tight ${achieved ? "text-white" : "text-zinc-500"
          }`}
      >
        {label}
      </span>
      {hint && (
        <span className="text-[10px] text-zinc-600 leading-tight">{hint}</span>
      )}
    </div>
  );
}

// ─── Sección 4 — Chart de barras + lista ──────────────────────────────────────

function formatPeriodLabel(periodStart: string): string {
  try {
    return format(parseISO(periodStart), "MMM", { locale: es });
  } catch {
    return periodStart.slice(0, 7);
  }
}

function formatPeriodFull(periodStart: string): string {
  try {
    return format(parseISO(periodStart), "MMMM yyyy", { locale: es });
  } catch {
    return periodStart;
  }
}

function PeriodChart({ periods }: { periods: PeriodHistory[] }) {
  if (periods.length === 0) return null;

  const maxClasses = Math.max(...periods.map((p) => p.classesAttended));
  // Si todos los períodos tienen 0 clases (fallback sin datos), usar altura uniforme
  const hasClassData = maxClasses > 0;
  // Mostrar en orden cronológico en el chart (más antiguo a la izquierda)
  const chartPeriods = [...periods].reverse();

  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Historial de clases
      </p>

      {/* Chart de barras */}
      <div className="flex items-end gap-2 h-28 pt-2">
        {chartPeriods.map((period, i) => {
          const heightPct = hasClassData
            ? Math.max((period.classesAttended / maxClasses) * 60, 6)
            : 50; // altura uniforme cuando no hay conteo de clases
          return (
            <div
              key={`chart-${i}-${period.periodStart}`}
              className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
            >
              {period.classesAttended > 0 && (
                <span className="text-[10px] font-semibold text-lime-400 mb-0.5">
                  {period.classesAttended}
                </span>
              )}
              <div
                className="w-full rounded-sm bg-lime-400/80 transition-all duration-300"
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[9px] text-zinc-500 capitalize whitespace-nowrap">
                {formatPeriodLabel(period.periodStart)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function StatsDrawer({ userId, isOpen, onClose }: StatsDrawerProps) {
  const { data, isLoading, isError } = useUserStats(userId, isOpen);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-zinc-950 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-white text-lg font-bold">
            Tus estadísticas
          </DrawerTitle>
        </DrawerHeader>

        {isLoading && <StatsSkeleton />}

        {isError && (
          <div className="px-4 pb-8 text-center text-zinc-500 text-sm">
            No se pudieron cargar las estadísticas. Inténtalo de nuevo.
          </div>
        )}

        {data && (
          <div className="space-y-3 px-4 pb-10">
            {/* Sección 1 — Números principales */}
            <div className="grid grid-cols-2 gap-3">
              <NumberCard value={data.totalClasses} label="clases completadas" />
              <NumberCard
                value={data.monthsActive}
                label={data.monthsActive === 1 ? "mes entrenando" : "meses entrenando"}
              />
            </div>

            {/* Sección 2 — Hábitos */}
            {(data.favoriteDiscipline || data.favoriteTime) && (
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {data.favoriteDiscipline && (
                    <>
                      Tu disciplina favorita es{" "}
                      <span className="text-white font-semibold">
                        {data.favoriteDiscipline}
                      </span>
                    </>
                  )}
                  {data.favoriteDiscipline && data.favoriteTime && " · "}
                  {data.favoriteTime && (
                    <>
                      Te gusta entrenar por la{" "}
                      <span className="text-white font-semibold">
                        {data.favoriteTime === "AM" ? "mañana" : "tarde"}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Sección 3 — Logros */}
            {data.achievements.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Logros
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {data.achievements.map((a) => (
                    <AchievementBadge key={a.id} achievement={a} />
                  ))}
                </div>
              </div>
            )}

            {/* Sección 4 — Historial por período */}
            {data.periodHistory.length > 0 && (
              <PeriodChart periods={data.periodHistory} />
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
