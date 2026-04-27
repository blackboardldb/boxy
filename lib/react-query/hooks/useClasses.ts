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
  myBookings: (userId: string, startDate?: string) =>
    ["classes", "myBookings", userId, startDate] as const,
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
 * Estrategia post-mutación: invalidateQueries en lugar de optimistic update.
 * Fundamento: inscripción en clase tiene latencia tolerable (300-500ms).
 * El riesgo de rollback mal implementado supera el beneficio UX marginal.
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

    onSuccess: (_data, variables) => {
      // Invalida todo el calendario y los bookings del usuario
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: classKeys.myBookings(variables.userId),
      });
      // Invalida /api/me para reflejar classesAttended actualizado
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * useCancelClassRegistration — cancelar inscripción del alumno.
 * Misma estrategia: invalidateQueries.
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

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: classKeys.myBookings(variables.userId),
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
