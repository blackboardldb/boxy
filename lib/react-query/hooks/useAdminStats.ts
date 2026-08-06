import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";

export const adminStatsKeys = {
  stats: (orgId: string) => ["admin", "stats", orgId] as const,
  expiring: (orgId: string, take: number, skip: number) =>
    ["admin", "members", "expiring", orgId, { take, skip }] as const,
  expired: (orgId: string, take: number, skip: number) =>
    ["admin", "members", "expired", orgId, { take, skip }] as const,
  financeCompare: (orgId: string) => ["admin", "finance-compare", orgId] as const,
};

export function useAdminStats() {
  const orgId = useActiveOrgId();
  return useQuery({
    queryKey: adminStatsKeys.stats(orgId ?? ""),
    queryFn: () => fetchClient<any>("/admin/stats").then(res => res.data),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,   // 5 min — fuente de verdad del dashboard
    gcTime: 1000 * 60 * 15,     // mantener en caché 15min entre navegaciones
    placeholderData: keepPreviousData,
  });
}

export function useExpiringMembers(take = 5, skip = 0) {
  const orgId = useActiveOrgId();
  return useQuery({
    queryKey: adminStatsKeys.expiring(orgId ?? "", take, skip),
    queryFn: () =>
      fetchClient<any>(`/admin/members/expiring?take=${take}&skip=${skip}`).then(res => res.data),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 10,  // 10 min — lista secundaria, no bloquea LCP
    gcTime: 1000 * 60 * 20,
    placeholderData: keepPreviousData,
  });
}

export function useExpiredMembers(take = 5, skip = 0) {
  const orgId = useActiveOrgId();
  return useQuery({
    queryKey: adminStatsKeys.expired(orgId ?? "", take, skip),
    queryFn: () =>
      fetchClient<any>(`/admin/members/expired?take=${take}&skip=${skip}`).then(res => res.data),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 10,  // 10 min — lista secundaria, no bloquea LCP
    gcTime: 1000 * 60 * 20,
    placeholderData: keepPreviousData,
  });
}

// Carga diferida — no bloquea el render inicial del dashboard.
// Se monta de forma independiente y muestra su propio skeleton.
export function useAdminFinanceCompare() {
  const orgId = useActiveOrgId();
  return useQuery({
    queryKey: adminStatsKeys.financeCompare(orgId ?? ""),
    queryFn: () => fetchClient<any>("/admin/finance-compare").then(res => res.data),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2,   // 2 min — datos comparativos cambian más seguido
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}
