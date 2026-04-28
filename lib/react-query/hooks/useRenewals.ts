import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

export const renewalKeys = {
  all: ["renewals"] as const,
  pending: () => ["renewals", "pending"] as const,
};

export function usePendingRenewals() {
  return useQuery({
    queryKey: renewalKeys.pending(),
    queryFn: () => fetchClient<any>("/admin/renewals?status=pending").then((res) => res.data),
    staleTime: 1000 * 60, // 1 minuto
    refetchOnWindowFocus: true, // Se revalida cuando el admin vuelve a la pestaña
  });
}

export function useApproveRenewal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, startDate }: { userId: string; startDate: string }) =>
      fetchClient<any>(`/users/${userId}/renewal/approve`, {
        method: "POST",
        body: JSON.stringify({ startDate }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: renewalKeys.pending() });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRejectRenewal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      fetchClient<any>(`/users/${userId}/renewal/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: renewalKeys.pending() });
    },
  });
}
