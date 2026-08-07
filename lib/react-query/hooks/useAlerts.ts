import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";

export const alertKeys = {
  all: (orgId: string) => ["alerts", orgId] as const,
  lists: (orgId: string) => ["alerts", orgId, "list"] as const,
};

export function useAlerts() {
  const orgId = useActiveOrgId();
  return useQuery({
    queryKey: alertKeys.lists(orgId ?? ""),
    queryFn: () => fetchClient<any>("/admin/alerts"),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (alertData: unknown) =>
      fetchClient<any>("/admin/alerts", {
        method: "POST",
        body: JSON.stringify(alertData),
      }),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: alertKeys.lists(orgId) });
      }
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();
  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<any>(`/admin/alerts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: alertKeys.lists(orgId) });
      }
    },
  });
}
