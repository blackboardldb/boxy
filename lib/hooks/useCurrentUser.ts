import { useEffect, useState } from "react";
import type { FitCenterUserProfile } from "@/lib/types";

interface UseCurrentUserResult {
  currentUser: FitCenterUserProfile | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [currentUser, setCurrentUser] = useState<FitCenterUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/me");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Error ${res.status}`);
        }

        const { data } = await res.json();
        if (!cancelled) {
          setCurrentUser(data as FitCenterUserProfile);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchMe();
    return () => { cancelled = true; };
  }, [trigger]);

  return { currentUser, isLoading, error, reload: () => setTrigger((t) => t + 1) };
}
