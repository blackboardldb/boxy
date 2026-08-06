import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";
import { adminStatsKeys } from "./useAdminStats";
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
  all: (orgId: string) => ["users", orgId] as const,
  lists: (orgId: string) => ["users", orgId, "list"] as const,
  list: (orgId: string, params: UserListParams) => ["users", orgId, "list", params] as const,
  detail: (orgId: string, id: string) => ["users", orgId, "detail", id] as const,
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
  const orgId = useActiveOrgId();
  const { page = 1, limit = 10, search = "", status, role } = params;

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) searchParams.set("search", search);
  if (status) searchParams.set("status", status);
  if (role) searchParams.set("role", role);

  return useQuery({
    queryKey: userKeys.list(orgId ?? "", { page, limit, search, status, role }),
    queryFn: () =>
      fetchClient<UsersApiResponse>(`/users?${searchParams.toString()}`).then(
        (res) => ({
          users: res.data ?? [],
          pagination: res.meta?.pagination ?? res.pagination ?? null,
        })
      ),
    staleTime: 1000 * 60 * 2, // 2 min — usuarios cambian moderadamente
    placeholderData: (prev) => prev, // mantiene datos anteriores mientras carga nueva página
    enabled: params.enabled !== false && !!orgId,
  });
}

/**
 * useUser — datos de un usuario específico por ID.
 */
export function useUser(id: string) {
  const orgId = useActiveOrgId();
  return useQuery({
    queryKey: userKeys.detail(orgId ?? "", id),
    queryFn: () =>
      fetchClient<UserApiResponse>(`/users/${id}`).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(id) && !!orgId,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

  return useMutation({
    mutationFn: (userData: Partial<User>) =>
      fetchClient<UserApiResponse>("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      }).then((res) => res.data),

    onSuccess: () => {
      // Invalida todas las listas — el nuevo usuario puede aparecer en cualquier filtro
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists(orgId) });
      }
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      fetchClient<UserApiResponse>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => res.data),

    onSuccess: (_data, variables) => {
      // Invalida el detalle del usuario editado y todas las listas
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(orgId, variables.id) });
        queryClient.invalidateQueries({ queryKey: userKeys.lists(orgId) });
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const orgId = useActiveOrgId();

  return useMutation({
    mutationFn: (id: string) =>
      fetchClient<{ success: boolean }>(`/users/${id}`, {
        method: "DELETE",
      }),

    onSuccess: (_data, id) => {
      // Guard defensivo: orgId debería estar siempre resuelto acá porque el componente
      // que dispara la mutation ya está montado en un contexto de tenant válido.
      if (orgId) {
        queryClient.removeQueries({ queryKey: userKeys.detail(orgId, id) });
        queryClient.invalidateQueries({ queryKey: userKeys.lists(orgId) });
        queryClient.invalidateQueries({ queryKey: adminStatsKeys.stats(orgId) });
      }
    },
  });
}
