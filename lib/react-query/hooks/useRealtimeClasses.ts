"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { classKeys } from "./useClasses";

/**
 * Hook para escuchar cambios en tiempo real en la tabla de clases
 * y actualizar el caché de React Query automáticamente.
 */
export function useRealtimeClasses() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime-classes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "class_sessions",
        },
        (payload) => {
          console.log("Realtime change detected in ClassSession:", payload);
          
          // Invalidar todas las listas de clases para forzar el refetch
          queryClient.invalidateQueries({ queryKey: classKeys.all });
          
          // Si el cambio es en una clase específica, invalidar también participantes si aplica
          if (payload.new && (payload.new as any).id) {
            queryClient.invalidateQueries({ 
              queryKey: classKeys.participants((payload.new as any).id) 
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
