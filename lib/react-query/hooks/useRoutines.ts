import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoutineAssignmentForMember } from "@/lib/types/routine";

export const routineKeys = {
  all: ["my-routines"] as const,
  list: (startDate: string, endDate: string) => ["my-routines", startDate, endDate] as const,
};

export function useRoutines({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams();
  if (startDate) searchParams.set("from", startDate);
  if (endDate) searchParams.set("to", endDate);

  return useQuery({
    queryKey: routineKeys.list(startDate ?? "", endDate ?? ""),
    queryFn: async (): Promise<RoutineAssignmentForMember[]> => {
      const res = await fetch(`/api/routines?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Error al cargar rutinas");
      return res.json();
    },
    enabled: !!(startDate && endDate),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useCompleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, memberNotes }: { id: string; memberNotes?: string }) => {
      const res = await fetch(`/api/routines/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberNotes }),
      });
      if (!res.ok) throw new Error("Error al marcar como completado");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
    },
  });
}
