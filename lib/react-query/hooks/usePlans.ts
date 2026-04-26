import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { MembershipPlan as Plan } from "@/lib/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const planKeys = {
  all: ["plans"] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
  }) => ["plans", "list", params] as const,
};

// ─── Tipos de respuesta de la API ─────────────────────────────────────────────
interface PlansApiResponse {
  data?: Plan[];
  plans?: Plan[];
}

interface PlanApiResponse {
  data?: Plan;
  plan?: Plan;
}

// ─── Hooks de lectura ─────────────────────────────────────────────────────────

export function usePlans(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("limit", String(params?.limit ?? 50));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.isActive !== undefined)
    searchParams.set("isActive", params.isActive);

  return useQuery({
    queryKey: planKeys.list(params),
    queryFn: () =>
      fetchClient<PlansApiResponse>(
        `/plans?${searchParams.toString()}`
      ).then((res) => {
        const raw = res.data ?? res.plans ?? [];
        // Filtrar entradas malformadas (igual que el store original hacía)
        return raw.filter((p): p is Plan => Boolean(p && p.id && p.name));
      }),
    staleTime: 1000 * 60 * 10, // 10 min — los planes cambian poco
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planData: Partial<Plan>) =>
      fetchClient<PlanApiResponse>("/plans", {
        method: "POST",
        body: JSON.stringify(planData),
      }).then((res) => res.data ?? res.plan!),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) =>
      fetchClient<PlanApiResponse>(`/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => res.data ?? res.plan!),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<{ success: boolean }>(`/plans/${id}`, {
        method: "DELETE",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
