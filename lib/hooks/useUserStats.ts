// lib/hooks/useUserStats.ts
import { useQuery } from "@tanstack/react-query";
import type { UserStatsResponse } from "@/app/api/users/[id]/stats/route";

async function fetchUserStats(userId: string): Promise<UserStatsResponse> {
  const res = await fetch(`/api/users/${userId}/stats`);
  if (!res.ok) {
    throw new Error("Error al cargar estadísticas");
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? "Error al cargar estadísticas");
  }
  return json.data as UserStatsResponse;
}

/**
 * Hook para las estadísticas del alumno.
 *
 * - `enabled`: solo se ejecuta cuando el Drawer está abierto (lazy load)
 * - `staleTime`: 10 minutos — el request no se repite en aperturas siguientes
 */
export function useUserStats(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["user-stats", userId],
    queryFn: () => fetchUserStats(userId),
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000, // 10 min
    retry: 1,
  });
}
