import type { FitCenterUserProfile } from "@/lib/types";
import { useMe } from "@/lib/react-query/hooks/useMe";
import { useQueryClient } from "@tanstack/react-query";
import { meKeys } from "@/lib/react-query/hooks/useMe";

interface UseCurrentUserResult {
  currentUser: FitCenterUserProfile | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useCurrentUser(): UseCurrentUserResult {
  const queryClient = useQueryClient();
  const { data: currentUser = null, isLoading, error } = useMe();

  return {
    currentUser,
    isLoading,
    error: error?.message ?? null,
    reload: () => queryClient.invalidateQueries({ queryKey: meKeys.me }),
  };
}

