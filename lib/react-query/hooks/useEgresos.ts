import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";
import { adminStatsKeys } from "./useAdminStats";
import { financeKeys } from "./useFinances";

// ─── Tipo ─────────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  motivo: string;
  fecha: string; // ISO date string
  monto: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const egresoKeys = {
  all: (orgId: string) => ["egresos", orgId] as const,
  list: (orgId: string, year: number, month: number) =>
    ["egresos", orgId, "list", { year, month }] as const,
};

// ─── Tipos de respuesta de la API ─────────────────────────────────────────────
interface EgresosApiResponse {
  success: boolean;
  data: Expense[];
  total?: number;
}

interface EgresoApiResponse {
  success: boolean;
  data: Expense;
  message?: string;
}

// ─── Hook de lectura ─────────────────────────────────────────────────────────

/**
 * Fetches egresos filtered by year and month (0-indexed month, igual que Date.getMonth()).
 * La caché se segmenta por (year, month) — cambiar el mes hace un fetch nuevo,
 * pero volver al mes anterior reutiliza la caché sin request adicional.
 */
export function useEgresos(year: number, month: number) {
  const orgId = useActiveOrgId();
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  return useQuery({
    queryKey: egresoKeys.list(orgId ?? "", year, month),
    queryFn: () =>
      fetchClient<EgresosApiResponse>(`/expenses?${params.toString()}`).then(
        (res) => res.data ?? []
      ),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 min — egresos cambian con baja frecuencia
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateEgreso(year: number, month: number) {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

  return useMutation({
    mutationFn: (payload: { motivo: string; fecha: string; monto: number }) =>
      fetchClient<EgresoApiResponse>("/expenses", {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => res.data),

    onSuccess: () => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        // Invalida el mes activo y las vistas dependientes para ESTE tenant
        queryClient.invalidateQueries({
          queryKey: egresoKeys.list(orgId, year, month),
        });
        queryClient.invalidateQueries({ queryKey: financeKeys.all(orgId) });
        queryClient.invalidateQueries({ queryKey: adminStatsKeys.stats(orgId) });
      }
    },
  });
}

export function useDeleteEgreso(year: number, month: number) {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<{ success: boolean }>(`/expenses/${id}`, {
        method: "DELETE",
      }),

    onSuccess: () => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        queryClient.invalidateQueries({
          queryKey: egresoKeys.list(orgId, year, month),
        });
        queryClient.invalidateQueries({ queryKey: financeKeys.all(orgId) });
        queryClient.invalidateQueries({ queryKey: adminStatsKeys.stats(orgId) });
      }
    },
  });
}
