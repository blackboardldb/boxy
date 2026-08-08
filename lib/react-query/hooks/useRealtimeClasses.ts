"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";
import { classKeys } from "./useClasses";

/**
 * Hook para escuchar cambios en tiempo real en la tabla de clases
 * y actualizar el caché de React Query automáticamente.
 */
export function useRealtimeClasses() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const orgId = useActiveOrgId();

  useEffect(() => {
    if (!orgId) return;

    const channel = supabase
      .channel(`realtime-classes-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "class_sessions",
          filter: `organizationId=eq.${orgId}`,
        },
        (payload) => {
          console.log("Realtime change detected in ClassSession:", payload);

          // Invalidar todas las listas de clases para forzar el refetch
          // Nota de seguridad: RLS no está activo en la BD (confirmado). El filtro de 
          // organizationId de arriba es la ÚNICA barrera de contención client-side para 
          // aislar eventos entre tenants. Si un cliente altera la query, puede escuchar 
          // clases de otros gimnasios. (Riesgo residual aceptado para este vector).
          queryClient.invalidateQueries({ queryKey: classKeys.all(orgId) });

          // Si el cambio es en una clase específica, invalidar también participantes si aplica
          if (payload.new && (payload.new as any).id) {
            queryClient.invalidateQueries({
              queryKey: classKeys.participants(orgId, (payload.new as any).id)
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);
}
