import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

export interface PlanHistoryItem {
  id:            string;
  status:        string;   // "approved" | "scheduled"
  planName:      string;
  startDate:     string | null;
  endDate:       string | null;
  amount:        number | null;
  paymentMethod: string | null;
  processedAt:   string | null;
}

interface PlanHistoryResponse {
  success: boolean;
  data: PlanHistoryItem[];
  nextCursor: string | null;
}

export const planHistoryKeys = {
  history: (userId: string) => ["plan-history", userId] as const,
};

/**
 * usePlanHistory — historial de planes finalizados (approved) de un alumno.
 *
 * La carga es diferida: solo fetcha cuando `enabled` es true
 * (es decir, cuando el admin abre el acordeón "Historial de Planes").
 */
export function usePlanHistory(userId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: planHistoryKeys.history(userId),
    queryFn: ({ pageParam = null }: { pageParam?: string | null }) => {
      const query = pageParam ? `?cursor=${encodeURIComponent(pageParam)}&limit=5` : `?limit=5`;
      return fetchClient<PlanHistoryResponse>(`/users/${userId}/plan-history${query}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
