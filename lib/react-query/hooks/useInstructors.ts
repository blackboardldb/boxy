import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { Instructor } from "@/lib/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface InstructorsApiResponse {
  success: boolean;
  data: Instructor[];
}

export interface InstructorsParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string; // "true" | "false" | "todos"
}

interface PaginatedInstructorsResponse {
  success: boolean;
  data: Instructor[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const instructorKeys = {
  all: ["instructors"] as const,
  minimal: () => ["instructors", "minimal"] as const,
  lists: () => ["instructors", "list"] as const,
  list: (params: InstructorsParams) => ["instructors", "list", params] as const,
};

// ─── useInstructorsMinimal ────────────────────────────────────────────────────
/**
 * Listado ligero para resolver nombres en calendarios y listas de clases.
 * staleTime: 15min — instructores cambian raramente.
 */
export function useInstructorsMinimal() {
  return useQuery({
    queryKey: instructorKeys.minimal(),
    queryFn: () =>
      fetchClient<InstructorsApiResponse>("/instructors?minimal=true&limit=100").then(
        (res) => res.data ?? []
      ),
    staleTime: 1000 * 60 * 15,
  });
}

// ─── usePaginatedInstructors ──────────────────────────────────────────────────
/**
 * usePaginatedInstructors({ page, limit, search, role, isActive })
 * queryKey incluye todos los filtros — cada combinación tiene su propia caché.
 */
export function usePaginatedInstructors(params: InstructorsParams = {}) {
  const { page = 1, limit = 10, search = "", role = "", isActive = "todos" } = params;

  const searchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) searchParams.set("search", search);
  if (role && role !== "todos") searchParams.set("role", role);
  if (isActive && isActive !== "todos") searchParams.set("isActive", isActive);

  return useQuery({
    queryKey: instructorKeys.list({ page, limit, search, role, isActive }),
    queryFn: () =>
      fetchClient<PaginatedInstructorsResponse>(`/instructors?${searchParams.toString()}`),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Instructor>) =>
      fetchClient<{ success: boolean; data: Instructor }>("/instructors", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.minimal() });
    },
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Instructor> }) =>
      fetchClient<{ success: boolean; data: Instructor }>(`/instructors/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.minimal() });
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<{ success: boolean }>(`/instructors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.minimal() });
    },
  });
}

/**
 * useToggleInstructorStatus — alterna isActive vía PUT.
 * Requiere currentStatus para poder invertirlo localmente antes del request.
 */
export function useToggleInstructorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: boolean }) =>
      fetchClient<{ success: boolean; data: Instructor }>(`/instructors/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !currentStatus }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instructorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: instructorKeys.minimal() });
    },
  });
}
