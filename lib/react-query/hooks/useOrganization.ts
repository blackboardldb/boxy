import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { Organization } from "@/lib/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const orgKeys = {
  org: ["organization"] as const,
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface OrgApiResponse {
  success: boolean;
  data: Organization;
}

// ─── useOrganization — datos de la organización autenticada ──────────────────
/**
 * useOrganization
 *
 * Decisiones HAL-10 Fase 4:
 * - staleTime: 10min — la configuración de la organización (logos, nombre) cambia
 *   muy raramente. 10min evita requests innecesarios en navegaciones internas.
 * - gcTime: 30min — mantener en cache inactiva para acceso offline temporal.
 * - enabled: true por defecto — puede deshabilitarse en rutas sin auth.
 */
export function useOrganization(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: orgKeys.org,
    queryFn: () =>
      fetchClient<OrgApiResponse>("/organization").then((res) => res.data),
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30,    // 30 minutos
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}

// ─── useUpdateOrganization — PUT /api/organization ───────────────────────────
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organization: Partial<Organization> & { id: string }) =>
      fetchClient<OrgApiResponse>("/organization", {
        method: "PUT",
        body: JSON.stringify(organization),
      }).then((res) => res.data),

    onSuccess: (updatedOrg) => {
      // Actualizar cache directamente con el dato devuelto por el servidor
      queryClient.setQueryData(orgKeys.org, updatedOrg);
    },
  });
}
