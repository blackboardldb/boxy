import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import type { FitCenterUserProfile as User } from "@/lib/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  enabled?: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersApiResponse {
  success: boolean;
  data: User[];
  meta?: { pagination?: PaginationMeta };
  pagination?: PaginationMeta;
}

interface UserApiResponse {
  success: boolean;
  data: User;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  lists: () => ["users", "list"] as const,
  list: (params: UserListParams) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

// ─── Hooks de lectura ─────────────────────────────────────────────────────────

/**
 * usePaginatedUsers — listado de usuarios con paginación server-side.
 *
 * queryKey incluye todos los filtros: cada combinación (page, search, status)
 * tiene su propia caché. Volver a una página ya visitada reutiliza el caché
 * sin request adicional (dentro del staleTime).
 */
export function usePaginatedUsers(params: UserListParams = {}) {
  const { page = 1, limit = 10, search = "", status, role } = params;

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) searchParams.set("search", search);
  if (status) searchParams.set("status", status);
  if (role) searchParams.set("role", role);

  return useQuery({
    queryKey: userKeys.list({ page, limit, search, status, role }),
    queryFn: () =>
      fetchClient<UsersApiResponse>(`/users?${searchParams.toString()}`).then(
        (res) => ({
          users: res.data ?? [],
          pagination: res.meta?.pagination ?? res.pagination ?? null,
        })
      ),
    staleTime: 1000 * 60 * 2, // 2 min — usuarios cambian moderadamente
    placeholderData: (prev) => prev, // mantiene datos anteriores mientras carga nueva página
    enabled: params.enabled,
  });
}

/**
 * useUser — datos de un usuario específico por ID.
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () =>
      fetchClient<UserApiResponse>(`/users/${id}`).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(id),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<User>) =>
      fetchClient<UserApiResponse>("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      }).then((res) => res.data),

    onSuccess: () => {
      // Invalida todas las listas — el nuevo usuario puede aparecer en cualquier filtro
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      fetchClient<UserApiResponse>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => res.data),

    onSuccess: (_data, variables) => {
      // Invalida el detalle del usuario editado y todas las listas
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<{ success: boolean }>(`/users/${id}`, {
        method: "DELETE",
      }),

    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
