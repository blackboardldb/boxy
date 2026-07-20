import { useQuery } from "@tanstack/react-query";

interface SimpleStats {
  totalClasses: number;
  favoriteDayOfWeek: number | null;
  favoriteHour: number | null;
}

export function useSimpleStats(userId: string) {
  return useQuery<SimpleStats>({
    queryKey: ["simple-stats", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/stats-simple`);
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      return res.json();
    },
    enabled: !!userId,
  });
}
