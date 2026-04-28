"use client";

import { useClasses } from "@/lib/react-query/hooks/useClasses";
import { usePendingRenewals } from "@/lib/react-query/hooks/useRenewals";

// HAL-01 Fase 4 Sprint 3.1: Ya no lee pendingRenewal del JSONB.
// El conteo de renovaciones se obtiene desde usePendingRenewals.
// El conteo de clases canceladas se obtiene vía useClasses.

export function useNotificationCount() {
  const { data: classesData } = useClasses({ limit: 50 }); // Fetch recent classes
  const { data: pendingRenewals = [] } = usePendingRenewals();

  const classSessions = classesData || [];
  // Clases canceladas
  const cancelledClassCount =
    classSessions.filter((cls: any) => cls.status === "cancelled").slice(0, 3)
      .length > 0
      ? 1
      : 0;

  return pendingRenewals.length + cancelledClassCount;
}
