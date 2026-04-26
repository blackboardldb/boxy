import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { Discipline } from "@/lib/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const disciplineKeys = {
  all: ["disciplines"] as const,
  list: (params?: { page?: number; limit?: number; isActive?: string }) =>
    ["disciplines", "list", params] as const,
};

// ─── Tipos de respuesta de la API ─────────────────────────────────────────────
interface DisciplinesApiResponse {
  data: Discipline[];
  total?: number;
}

interface DisciplineApiResponse {
  data?: Discipline;
  discipline?: Discipline;
}

// ─── Hooks de lectura ─────────────────────────────────────────────────────────

export function useDisciplines(params?: {
  page?: number;
  limit?: number;
  isActive?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit ?? 50));
  if (params?.isActive !== undefined)
    searchParams.set("isActive", params.isActive);

  return useQuery({
    queryKey: disciplineKeys.list(params),
    queryFn: () =>
      fetchClient<DisciplinesApiResponse>(
        `/disciplines?${searchParams.toString()}`
      ).then((res) => res.data),
    staleTime: 1000 * 60 * 10, // 10 min — las disciplinas cambian poco
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (disciplineData: Partial<Discipline>) =>
      fetchClient<DisciplineApiResponse>("/disciplines", {
        method: "POST",
        body: JSON.stringify(disciplineData),
      }).then((res) => res.data ?? res.discipline!),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.all });
    },
  });
}

export function useUpdateDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Discipline>;
    }) =>
      fetchClient<DisciplineApiResponse>(`/disciplines/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => res.data ?? res.discipline!),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.all });
    },
  });
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<{ success: boolean }>(`/disciplines/${id}`, {
        method: "DELETE",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.all });
    },
  });
}
