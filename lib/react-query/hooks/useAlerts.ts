import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

export const alertKeys = {
  all: ["alerts"] as const,
  lists: () => ["alerts", "list"] as const,
};

export function useAlerts() {
  return useQuery({
    queryKey: alertKeys.lists(),
    queryFn: () => fetchClient<any>("/admin/alerts"),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertData: unknown) =>
      fetchClient<any>("/admin/alerts", {
        method: "POST",
        body: JSON.stringify(alertData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<any>(`/admin/alerts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}
