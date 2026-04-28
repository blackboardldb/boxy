import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { ClassSession } from "@/lib/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface ClassesParams {
  startDate?: string; // "yyyy-MM-dd"
  endDate?: string;   // "yyyy-MM-dd"
  limit?: number;
  page?: number;
  status?: string;
}

interface ClassesApiResponse {
  success: boolean;
  data: ClassSession[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const classKeys = {
  all: ["classes"] as const,
  lists: () => ["classes", "list"] as const,
  list: (params: ClassesParams) => ["classes", "list", params] as const,
  // Clases de un usuario específico (historial de asistencia)
  userClasses: (userId: string) => ["classes", "user", userId] as const,
  // Bookings del alumno autenticado para la home
  myBookingsPrefix: (userId: string) => ["classes", "myBookings", userId] as const,
  myBookings: (userId: string, startDate?: string) =>
    ["classes", "myBookings", userId, startDate] as const,
  participants: (classId: string) => ["classes", "participants", classId] as const,
  notes: (classId: string) => ["classes", "notes", classId] as const,
};

// ─── useClasses — calendario semanal (admin y alumno) ────────────────────────
/**
 * useClasses({ startDate, endDate, limit? })
 *
 * Decisiones HAL-10 Sprint C:
 * - queryKey segmentado por (startDate, endDate): cada semana tiene su propia caché.
 *   Navegar hacia atrás reutiliza datos sin request si están dentro del staleTime.
 * - staleTime: 2min — el horario de clases cambia raramente; 2min evita flicker
 *   sin arriesgar datos muy desactualizados.
 * - enabled: solo si existe al menos uno de los dos parámetros de fecha para
 *   evitar un fetch vacío al montar.
 */
export function useClasses(params: ClassesParams = {}) {
  const { startDate, endDate, limit = 150, page = 1, status } = params;

  const searchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (startDate) searchParams.set("startDate", startDate);
  if (endDate) searchParams.set("endDate", endDate);
  if (status) searchParams.set("status", status);

  return useQuery({
    queryKey: classKeys.list({ startDate, endDate, limit, page, status }),
    queryFn: () =>
      fetchClient<ClassesApiResponse>(`/classes?${searchParams.toString()}`).then(
        (res) => res.data ?? []
      ),
    staleTime: 1000 * 60 * 2, // 2 minutos
    enabled: !!(startDate || endDate),
  });
}

// ─── useUserClasses — clases de un alumno específico (admin: detalle alumno) ──
/**
 * useUserClasses(userId, startDate?)
 *
 * Usado en admin/alumnos/[id] para mostrar el historial de asistencia del alumno.
 * queryKey incluye userId para que cada alumno tenga su propia caché independiente.
 */
export function useUserClasses(userId: string, startDate?: string) {
  const searchParams = new URLSearchParams();
  if (startDate) searchParams.set("startDate", startDate);

  return useQuery({
    queryKey: classKeys.userClasses(userId),
    queryFn: () =>
      fetchClient<{ success: boolean; data: ClassSession[] }>(
        `/users/${userId}/classes${startDate ? `?${searchParams.toString()}` : ""}`
      ).then((res) => res.data ?? []),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(userId),
  });
}

// ─── useMyBookings — clases del alumno autenticado (home del alumno) ──────────
/**
 * useMyBookings(userId, startDate?)
 *
 * Reutiliza el mismo endpoint /api/users/:id/classes pero con queryKey diferente
 * para separar el contexto del alumno del historial de admin.
 * Se invalida tras registro/cancelación.
 */
export function useMyBookings(userId: string | undefined, startDate?: string) {
  const searchParams = new URLSearchParams();
  if (startDate) searchParams.set("startDate", startDate);

  return useQuery({
    queryKey: classKeys.myBookings(userId ?? "", startDate),
    queryFn: () =>
      fetchClient<{ success: boolean; data: ClassSession[] }>(
        `/users/${userId}/classes${startDate ? `?${searchParams.toString()}` : ""}`
      ).then((res) => res.data ?? []),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(userId),
  });
}

// ─── Mutations de inscripción/cancelación ────────────────────────────────────

/**
 * useRegisterClass — inscribir alumno en una clase.
 *
 * Estrategia post-mutación: Optimistic Update + invalidateQueries.
 * Fundamento: Mejora radical de la UX en calendar app.
 */
export function useRegisterClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      userId,
    }: {
      classId: string;
      userId: string;
    }) =>
      fetchClient<{ success: boolean }>(`/classes/${classId}/register`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),

    onMutate: async ({ classId, userId }) => {
      await queryClient.cancelQueries({ queryKey: classKeys.lists() });
      const previousClasses = queryClient.getQueriesData({ queryKey: classKeys.lists() });

      queryClient.setQueriesData({ queryKey: classKeys.lists() }, (old: ClassSession[] | undefined) => {
        if (!old) return old;
        return old.map(session => {
          if (session.id === classId) {
            return {
              ...session,
              enrolledCount: (session.enrolledCount || 0) + 1,
              isUserRegistered: true,
              registeredParticipantsIds: [...(session.registeredParticipantsIds || []), userId]
            };
          }
          return session;
        });
      });

      // Cancelar y capturar myBookings
      await queryClient.cancelQueries({ queryKey: classKeys.myBookingsPrefix(userId) });
      const previousMyBookings = queryClient.getQueriesData({ 
        queryKey: classKeys.myBookingsPrefix(userId) 
      });

      // Actualizar myBookings optimistamente
      queryClient.setQueriesData(
        { queryKey: classKeys.myBookingsPrefix(userId) },
        (old: ClassSession[] | undefined) => {
          if (!old) return old;
          return old.map(session => {
            if (session.id !== classId) return session;
            return {
              ...session,
              isUserRegistered: true,
              enrolledCount: (session.enrolledCount ?? 0) + 1,
              registeredParticipantsIds: [...(session.registeredParticipantsIds || []), userId]
            };
          });
        }
      );

      return { previousClasses, previousMyBookings };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousClasses) {
        context.previousClasses.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousMyBookings) {
        context.previousMyBookings.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: classKeys.myBookingsPrefix(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * useCancelClassRegistration — cancelar inscripción del alumno.
 * Estrategia: Optimistic Update + invalidateQueries.
 */
export function useCancelClassRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      userId,
    }: {
      classId: string;
      userId: string;
    }) =>
      fetchClient<{ success: boolean }>(`/classes/${classId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),

    onMutate: async ({ classId, userId }) => {
      await queryClient.cancelQueries({ queryKey: classKeys.lists() });
      const previousClasses = queryClient.getQueriesData({ queryKey: classKeys.lists() });

      queryClient.setQueriesData({ queryKey: classKeys.lists() }, (old: ClassSession[] | undefined) => {
        if (!old) return old;
        return old.map(session => {
          if (session.id === classId) {
            return {
              ...session,
              enrolledCount: Math.max(0, (session.enrolledCount || 0) - 1),
              isUserRegistered: false,
              registeredParticipantsIds: (session.registeredParticipantsIds || []).filter(id => id !== userId)
            };
          }
          return session;
        });
      });

      // Cancelar y capturar myBookings
      await queryClient.cancelQueries({ queryKey: classKeys.myBookingsPrefix(userId) });
      const previousMyBookings = queryClient.getQueriesData({ 
        queryKey: classKeys.myBookingsPrefix(userId) 
      });

      // Actualizar myBookings optimistamente
      queryClient.setQueriesData(
        { queryKey: classKeys.myBookingsPrefix(userId) },
        (old: ClassSession[] | undefined) => {
          if (!old) return old;
          return old.map(session => {
            if (session.id !== classId) return session;
            return {
              ...session,
              isUserRegistered: false,
              enrolledCount: Math.max(0, (session.enrolledCount ?? 1) - 1),
              registeredParticipantsIds: (session.registeredParticipantsIds || []).filter(id => id !== userId)
            };
          });
        }
      );

      return { previousClasses, previousMyBookings };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousClasses) {
        context.previousClasses.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousMyBookings) {
        context.previousMyBookings.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: classKeys.myBookingsPrefix(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * useCancelClass — cancelar la clase completa (solo admin).
 */
export function useCancelClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) =>
      fetchClient<{ success: boolean }>(`/classes/cancel`, {
        method: "POST",
        body: JSON.stringify({ classId }),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

export function useClassParticipants(classId: string | undefined) {
  return useQuery({
    queryKey: classKeys.participants(classId ?? ""),
    queryFn: async () => {
      const res = await fetchClient<any>(`/classes/${classId}/participants`);
      return res.data;
    },
    enabled: !!classId,
    staleTime: 1000 * 30, // 30 segundos — participantes cambian frecuente
  });
}

export function useSaveClassNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, notes }: { classId: string; notes: string }) =>
      fetchClient(`/classes/${classId}/notes`, {
        method: "PUT",
        body: JSON.stringify({ notes }),
      }),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.notes(classId) });
    },
  });
}
