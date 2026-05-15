import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

export const adminStatsKeys = {
  stats: () => ["admin", "stats"] as const,
  expiring: (take: number, skip: number) =>
    ["admin", "members", "expiring", { take, skip }] as const,
  expired: (take: number, skip: number) =>
    ["admin", "members", "expired", { take, skip }] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminStatsKeys.stats(),
    queryFn: () => fetchClient<any>("/admin/stats").then(res => res.data),
    staleTime: 1000 * 60 * 5,   // 5 min — fuente de verdad del dashboard
    gcTime: 1000 * 60 * 15,     // mantener en caché 15min entre navegaciones
    placeholderData: keepPreviousData,
  });
}

export function useExpiringMembers(take = 5, skip = 0) {
  return useQuery({
    queryKey: adminStatsKeys.expiring(take, skip),
    queryFn: () =>
      fetchClient<any>(`/admin/members/expiring?take=${take}&skip=${skip}`).then(res => res.data),
    staleTime: 1000 * 60 * 10,  // 10 min — lista secundaria, no bloquea LCP
    gcTime: 1000 * 60 * 20,
    placeholderData: keepPreviousData,
  });
}

export function useExpiredMembers(take = 5, skip = 0) {
  return useQuery({
    queryKey: adminStatsKeys.expired(take, skip),
    queryFn: () =>
      fetchClient<any>(`/admin/members/expired?take=${take}&skip=${skip}`).then(res => res.data),
    staleTime: 1000 * 60 * 10,  // 10 min — lista secundaria, no bloquea LCP
    gcTime: 1000 * 60 * 20,
    placeholderData: keepPreviousData,
  });
}
