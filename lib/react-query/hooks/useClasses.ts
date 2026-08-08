import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { ClassSession } from "@/lib/types";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";

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
  all: (orgId: string) => ["classes", orgId] as const,
  lists: (orgId: string) => ["classes", orgId, "list"] as const,
  list: (orgId: string, params: ClassesParams) => ["classes", orgId, "list", params] as const,
  byDate: (orgId: string, params: { date?: string; startDate?: string; endDate?: string }) => 
    ["classes", orgId, "by-date", params] as const,
  // Clases de un usuario específico (historial de asistencia)
  userClasses: (orgId: string, userId: string) => ["classes", orgId, "user", userId] as const,
  // Bookings del alumno autenticado para la home
  myBookingsPrefix: (orgId: string, userId: string) => ["classes", orgId, "myBookings", userId] as const,
  myBookings: (orgId: string, userId: string, startDate?: string) =>
    ["classes", orgId, "myBookings", userId, startDate] as const,
  participants: (orgId: string, classId: string) => ["classes", orgId, "participants", classId] as const,
  notes: (orgId: string, classId: string) => ["classes", orgId, "notes", classId] as const,
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

  const activeOrgId = useActiveOrgId();

  return useQuery({
    queryKey: classKeys.list(activeOrgId || "", { startDate, endDate, limit, page, status }),
    queryFn: () =>
      fetchClient<ClassesApiResponse>(`/classes?${searchParams.toString()}`).then(
        (res) => res.data ?? []
      ),
    staleTime: 1000 * 60 * 2, // 2 minutos
    enabled: !!activeOrgId && !!(startDate || endDate),
  });
}

/**
 * useClassesByDate — obtiene clases reales y generadas para una fecha o rango.
 */
export function useClassesByDate(params: { date?: string; startDate?: string; endDate?: string }) {
  const { date, startDate, endDate } = params;
  const searchParams = new URLSearchParams();
  if (date) searchParams.set("date", date);
  if (startDate) searchParams.set("startDate", startDate);
  if (endDate) searchParams.set("endDate", endDate);

  const activeOrgId = useActiveOrgId();

  return useQuery({
    queryKey: classKeys.byDate(activeOrgId || "", params),
    queryFn: () =>
      fetchClient<{ classes: ClassSession[] }>(`/classes/by-date?${searchParams.toString()}`).then(
        (res) => res.classes ?? []
      ),
    staleTime: 1000 * 60 * 5,
    enabled: !!activeOrgId && !!(date || (startDate && endDate)),
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

  const activeOrgId = useActiveOrgId();

  return useQuery({
    queryKey: classKeys.userClasses(activeOrgId || "", userId),
    queryFn: () =>
      fetchClient<{ success: boolean; data: ClassSession[] }>(
        `/users/${userId}/classes${startDate ? `?${searchParams.toString()}` : ""}`
      ).then((res) => res.data ?? []),
    staleTime: 1000 * 60 * 5,
    enabled: !!activeOrgId && Boolean(userId),
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

  const activeOrgId = useActiveOrgId();

  return useQuery({
    queryKey: classKeys.myBookings(activeOrgId || "", userId ?? "", startDate),
    queryFn: () =>
      fetchClient<{ success: boolean; data: ClassSession[] }>(
        `/users/${userId}/classes${startDate ? `?${searchParams.toString()}` : ""}`
      ).then((res) => res.data ?? []),
    staleTime: 1000 * 60 * 2,
    enabled: !!activeOrgId && Boolean(userId),
  });
}

// ─── Mutations de administración ───────────────────────────────────────────────

export function useCreateClass() {
  const queryClient = useQueryClient();
  const activeOrgId = useActiveOrgId();

  return useMutation({
    mutationFn: (payload: {
      disciplineId: string;
      name?: string;
      dateTime: string;
      durationMinutes: number;
      instructorId: string;
      capacity: number;
    }) =>
      fetchClient<{ success: boolean }>("/classes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    onSuccess: () => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente que dispara la mutation ya está montado en un contexto de tenant válido.
      if (activeOrgId) {
        queryClient.invalidateQueries({ queryKey: classKeys.all(activeOrgId) });
      }
    },
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
  const activeOrgId = useActiveOrgId();

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
        // userId no se envía al backend porque el endpoint usa el auth context
      }),

    onMutate: async ({ classId, userId }) => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente que dispara la mutation ya está montado en un contexto de tenant válido.
      if (!activeOrgId) return { previousClasses: undefined, previousMyBookings: undefined };

      await queryClient.cancelQueries({ queryKey: classKeys.lists(activeOrgId) });
      const previousClasses = queryClient.getQueriesData({ queryKey: classKeys.lists(activeOrgId) });

      queryClient.setQueriesData({ queryKey: classKeys.lists(activeOrgId) }, (old: ClassSession[] | undefined) => {
        if (!old) return old;
        return old.map(session => {
          if (session.id === classId) {
            return {
              ...session,
              enrolledCount: (session.enrolledCount || 0) + 1,
              isUserRegistered: true,
            };
          }
          return session;
        });
      });

      // Bug resuelto: se aisla el optimistic update al usuario específico
      await queryClient.cancelQueries({ queryKey: classKeys.myBookingsPrefix(activeOrgId, userId) });
      const previousMyBookings = queryClient.getQueriesData({ 
        queryKey: classKeys.myBookingsPrefix(activeOrgId, userId) 
      });

      // Actualizar myBookings optimistamente
      queryClient.setQueriesData(
        { queryKey: classKeys.myBookingsPrefix(activeOrgId, userId) },
        (old: ClassSession[] | undefined) => {
          if (!old) return old;
          return old.map(session => {
            if (session.id !== classId) return session;
            return {
              ...session,
              isUserRegistered: true,
              enrolledCount: (session.enrolledCount ?? 0) + 1,
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
      if (activeOrgId) {
        queryClient.invalidateQueries({ queryKey: classKeys.all(activeOrgId) });
        queryClient.invalidateQueries({
          queryKey: classKeys.myBookingsPrefix(activeOrgId, variables.userId),
        });
      }
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
  const activeOrgId = useActiveOrgId();

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
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente que dispara la mutation ya está montado en un contexto de tenant válido.
      if (!activeOrgId) return { previousClasses: undefined, previousMyBookings: undefined };

      await queryClient.cancelQueries({ queryKey: classKeys.lists(activeOrgId) });
      const previousClasses = queryClient.getQueriesData({ queryKey: classKeys.lists(activeOrgId) });

      queryClient.setQueriesData({ queryKey: classKeys.lists(activeOrgId) }, (old: ClassSession[] | undefined) => {
        if (!old) return old;
        return old.map(session => {
          if (session.id === classId) {
            return {
              ...session,
              enrolledCount: Math.max(0, (session.enrolledCount || 0) - 1),
              isUserRegistered: false,
            };
          }
          return session;
        });
      });

      // Cancelar y capturar myBookings
      await queryClient.cancelQueries({ queryKey: classKeys.myBookingsPrefix(activeOrgId, userId) });
      const previousMyBookings = queryClient.getQueriesData({ 
        queryKey: classKeys.myBookingsPrefix(activeOrgId, userId) 
      });

      // Actualizar myBookings optimistamente
      queryClient.setQueriesData(
        { queryKey: classKeys.myBookingsPrefix(activeOrgId, userId) },
        (old: ClassSession[] | undefined) => {
          if (!old) return old;
          return old.map(session => {
            if (session.id !== classId) return session;
            return {
              ...session,
              isUserRegistered: false,
              enrolledCount: Math.max(0, (session.enrolledCount ?? 1) - 1),
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
      if (activeOrgId) {
        queryClient.invalidateQueries({ queryKey: classKeys.all(activeOrgId) });
        queryClient.invalidateQueries({
          queryKey: classKeys.myBookingsPrefix(activeOrgId, variables.userId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * useCancelClass — cancelar la clase completa (solo admin).
 */
export function useCancelClass() {
  const queryClient = useQueryClient();
  const activeOrgId = useActiveOrgId();

  return useMutation({
    mutationFn: (classId: string) =>
      fetchClient<{ success: boolean }>(`/classes/cancel`, {
        method: "POST",
        body: JSON.stringify({ classId }),
      }),

    onSuccess: () => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente que dispara la mutation ya está montado en un contexto de tenant válido.
      if (activeOrgId) {
        queryClient.invalidateQueries({ queryKey: classKeys.all(activeOrgId) });
      }
    },
  });
}

/**
 * useCancelDay — cancelar todas las clases de un día (solo admin).
 */
export function useCancelDay() {
  const queryClient = useQueryClient();
  const activeOrgId = useActiveOrgId();

  return useMutation({
    mutationFn: ({ 
      date, 
      organizationId, 
      generatedClasses 
    }: { 
      date: string; 
      organizationId: string; 
      generatedClasses?: any[] 
    }) =>
      fetchClient<{ success: boolean }>(`/classes/cancel-day`, {
        method: "POST",
        body: JSON.stringify({ date, organizationId, generatedClasses }),
      }),

    onSuccess: () => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente que dispara la mutation ya está montado en un contexto de tenant válido.
      if (activeOrgId) {
        queryClient.invalidateQueries({ queryKey: classKeys.all(activeOrgId) });
      }
    },
  });
}

export function useClassParticipants(classId: string | undefined) {
  const activeOrgId = useActiveOrgId();
  return useQuery({
    queryKey: classKeys.participants(activeOrgId || "", classId ?? ""),
    queryFn: async () => {
      const res = await fetchClient<any>(`/classes/${classId}/participants`);
      return res.data;
    },
    enabled: !!activeOrgId && !!classId,
    staleTime: 1000 * 30, // 30 segundos — participantes cambian frecuente
  });
}

export function useSaveClassNotes() {
  const queryClient = useQueryClient();
  const activeOrgId = useActiveOrgId();
  return useMutation({
    mutationFn: ({ classId, notes }: { classId: string; notes: string }) =>
      fetchClient(`/classes/${classId}/notes`, {
        method: "PUT",
        body: JSON.stringify({ notes }),
      }),
    onSuccess: (_, { classId }) => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente que dispara la mutation ya está montado en un contexto de tenant válido.
      if (activeOrgId) {
        queryClient.invalidateQueries({ queryKey: classKeys.lists(activeOrgId) });
        queryClient.invalidateQueries({ queryKey: classKeys.notes(activeOrgId, classId) });
      }
    },
  });
}

/**
 * useGenerateClassesAuto — regenerar clases masivamente.
 */
export function useGenerateClassesAuto() {
  const queryClient = useQueryClient();
  const activeOrgId = useActiveOrgId();

  return useMutation({
    mutationFn: (payload: { startDate: string; endDate: string }) =>
      fetchClient<{ success: boolean; classes: any[]; message: string }>("/classes/generate-auto", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (activeOrgId) {
        queryClient.invalidateQueries({ queryKey: classKeys.all(activeOrgId) });
      }
    },
  });
}
