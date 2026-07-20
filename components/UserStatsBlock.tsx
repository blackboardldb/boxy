"use client";

import { useSimpleStats } from "@/lib/hooks/useSimpleStats";
import { Skeleton } from "./ui/skeleton";

interface UserStatsBlockProps {
  userId: string;
}

const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// ─── Sección 1 — Número principal ─────────────────────────────────────────

function NumberCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
      <span className="text-4xl font-bold text-white leading-none">{value}</span>
      <span className="text-xs text-zinc-400 text-center">{label}</span>
    </div>
  );
}

// ─── Card "Tu horario fav" ──────────────────────────────────────────────────

function getTimeBlock(hour: number): { emoji: string; label: string } {
  if (hour >= 5 && hour < 12) return { emoji: "🌅", label: "Mañana" };
  if (hour >= 12 && hour < 19) return { emoji: "☀️", label: "Tarde" };
  return { emoji: "🌙", label: "Noche" };
}

function FavoriteTimeCard({
  favoriteDayOfWeek,
  favoriteHour,
}: {
  favoriteDayOfWeek: number | null;
  favoriteHour: number | null;
}) {
  if (favoriteDayOfWeek === null || favoriteHour === null) {
    return (
      <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
        <span className="text-3xl leading-none">📅</span>
        <span className="text-sm font-bold text-white leading-tight text-center">Sin datos</span>
        <span className="text-xs text-zinc-400 text-center">aún</span>
      </div>
    );
  }

  const { emoji, label } = getTimeBlock(favoriteHour);
  const dayName = DAYS_OF_WEEK[favoriteDayOfWeek];

  return (
    <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
      <span className="text-3xl leading-none">{emoji}</span>
      <span className="text-sm font-bold text-white leading-tight text-center">{label}</span>
      <span className="text-xs text-zinc-400 text-center">
        Tu horario fav
      </span>
    </div>
  );
}

// ─── Bloque principal ───────────────────────────────────────────────────────

export function UserStatsBlock({ userId }: UserStatsBlockProps) {
  const { data, isLoading } = useSimpleStats(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full">
        <Skeleton className="w-full h-24 rounded-xl bg-white/5" />
        <Skeleton className="w-full h-24 rounded-xl bg-white/5" />
      </div>
    );
  }

  if (!data) return null;

  const { totalClasses, favoriteDayOfWeek, favoriteHour } = data;

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <NumberCard
        value={totalClasses}
        label={totalClasses === 1 ? "clase completada" : "clases completadas"}
      />
      <FavoriteTimeCard favoriteDayOfWeek={favoriteDayOfWeek} favoriteHour={favoriteHour} />
    </div>
  );
}
