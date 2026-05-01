import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { FitCenterUserProfile as User } from "@/lib/types";

// ─── Query Key ────────────────────────────────────────────────────────────────
export const meKeys = {
  me: ["me"] as const,
};

// ─── Tipos de respuesta ───────────────────────────────────────────────────────
interface MeApiResponse {
  success?: boolean;
  data: User;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * useMe — datos del usuario autenticado.
 *
 * Decisiones de arquitectura (HAL-10 Sprint B):
 * - staleTime: 0 — auth siempre fresca. El endpoint /api/me promueve membresías
 *   scheduled→active en cada hit; no podemos permitir que React Query sirva datos
 *   stale para esto.
 * - gcTime: 5 min — mantenemos el dato en caché para evitar flashes entre navegaciones,
 *   pero cada mount refetch garantiza frescura.
 * - retry: 1 — si /api/me falla (401 etc.), no re-intentar agresivamente.
 * - enabled: true por defecto — se puede deshabilitar pasando { enabled: false }
 *   para rutas donde no es necesario (ej. login).
 */
export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: meKeys.me,
    queryFn: () =>
      fetchClient<MeApiResponse>("/me").then((res) => res.data),
    staleTime: 0,              // siempre refetch al mount
    gcTime: 1000 * 60 * 5,    // 5 min en caché inactiva
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 3, // refresca cada 3 min si la app está abierta
    enabled: options?.enabled ?? true,
  });
}

// ─── Helper para invalidar currentUser desde mutations ────────────────────────
export function useInvalidateMe() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: meKeys.me });
}
