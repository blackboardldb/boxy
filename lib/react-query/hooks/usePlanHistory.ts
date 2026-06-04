import { useQuery } from "@tanstack/react-query";
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
}

export const planHistoryKeys = {
  history: (userId: string) => ["plan-history", userId] as const,
};

/**
 * usePlanHistory — historial de planes finalizados (approved) de un alumno.
 *
 * La carga es diferida: solo fetcha cuando `enabled` es true
 * (es decir, cuando el admin abre el acordeón "Historial de Planes").
 * Las siguientes aperturas reutilizan el caché — sin petición adicional.
 */
export function usePlanHistory(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: planHistoryKeys.history(userId),
    queryFn:  () =>
      fetchClient<PlanHistoryResponse>(`/users/${userId}/plan-history`).then(
        (res) => res.data
      ),
    enabled:   enabled && Boolean(userId),
    staleTime: 1000 * 60 * 10, // 10 min — el historial no cambia frecuentemente
    gcTime:    1000 * 60 * 30,
  });
}
