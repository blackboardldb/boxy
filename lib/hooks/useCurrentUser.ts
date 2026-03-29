import { useEffect } from "react";
import type { FitCenterUserProfile } from "@/lib/types";
import { useBlackSheepStore } from "@/lib/blacksheep-store";

interface UseCurrentUserResult {
  currentUser: FitCenterUserProfile | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useCurrentUser(): UseCurrentUserResult {
  const { currentUser, isUserLoading, error, fetchMe } = useBlackSheepStore();

  useEffect(() => {
    // Solo dispara el fetch si no existe el usuario y no está cargando actualmente.
    // El store también tiene su propio chequeo interno, pero esto evita el efecto aquí.
    if (!currentUser && !isUserLoading) {
      fetchMe();
    }
  }, [currentUser, isUserLoading, fetchMe]);

  return { 
    currentUser, 
    isLoading: isUserLoading, 
    error, 
    reload: () => fetchMe() 
  };
}
