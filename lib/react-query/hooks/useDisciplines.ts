import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";
import type { Discipline } from "@/lib/types";
import { classKeys } from "./useClasses";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const disciplineKeys = {
  all: (orgId: string) => ["disciplines", orgId] as const,
  list: (orgId: string, params?: { page?: number; limit?: number; isActive?: string }) =>
    ["disciplines", orgId, "list", params] as const,
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
  const orgId = useActiveOrgId();
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit ?? 50));
  if (params?.isActive !== undefined)
    searchParams.set("isActive", params.isActive);

  return useQuery({
    queryKey: disciplineKeys.list(orgId ?? "", params),
    queryFn: () =>
      fetchClient<DisciplinesApiResponse>(
        `/disciplines?${searchParams.toString()}`
      ).then((res) => res.data),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 10, // 10 min — las disciplinas cambian poco
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

  return useMutation({
    mutationFn: (disciplineData: Partial<Discipline>) =>
      fetchClient<DisciplineApiResponse>("/disciplines", {
        method: "POST",
        body: JSON.stringify(disciplineData),
      }).then((res) => res.data ?? res.discipline!),

    onSuccess: () => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: disciplineKeys.all(orgId) });
        queryClient.invalidateQueries({ queryKey: classKeys.all(orgId) });
      }
    },
  });
}

export function useUpdateDiscipline() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

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
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: disciplineKeys.all(orgId) });
        queryClient.invalidateQueries({ queryKey: classKeys.all(orgId) });
      }
    },
  });
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<{ success: boolean }>(`/disciplines/${id}`, {
        method: "DELETE",
      }),

    onSuccess: () => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: disciplineKeys.all(orgId) });
      }
    },
  });
}
