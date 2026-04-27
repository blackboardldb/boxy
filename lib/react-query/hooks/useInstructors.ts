import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { Instructor } from "@/lib/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface InstructorsApiResponse {
  success: boolean;
  data: Instructor[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const instructorKeys = {
  all: ["instructors"] as const,
  minimal: () => ["instructors", "minimal"] as const,
};

// ─── useInstructorsMinimal ────────────────────────────────────────────────────
/**
 * useInstructorsMinimal — listado ligero de instructores para resolución de
 * nombres en calendarios y listas de clases.
 *
 * Decisiones HAL-10 Sprint C:
 * - staleTime: 15min — los instructores cambian con muy poca frecuencia.
 *   No tiene sentido re-fetching en cada render o cambio de semana.
 * - El flag ?minimal=true reduce el payload al mínimo (id, firstName, lastName).
 * - gcTime por defecto (5min) — se mantiene en caché entre navegaciones.
 */
export function useInstructorsMinimal() {
  return useQuery({
    queryKey: instructorKeys.minimal(),
    queryFn: () =>
      fetchClient<InstructorsApiResponse>("/instructors?minimal=true&limit=100").then(
        (res) => res.data ?? []
      ),
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}
