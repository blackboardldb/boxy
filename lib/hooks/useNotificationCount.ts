"use client";

import { useState, useEffect, useRef } from "react";
import { useClasses } from "@/lib/react-query/hooks/useClasses";

// HAL-01 Fase 4 Sprint 3.1: Ya no lee pendingRenewal del JSONB.
// El conteo de renovaciones se obtiene desde /api/admin/renewals (tabla MembershipRenewal).
// El conteo de clases canceladas se obtiene vía useClasses limitándolo a estado 'cancelled' si es necesario.

const POLL_INTERVAL_MS = 60_000; // Refrescar cada 60 segundos

export function useNotificationCount() {
  const { data: classesData } = useClasses({ limit: 50 }); // Fetch recent classes
  const [renewalCount, setRenewalCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchRenewalCount = async () => {
      try {
        const res = await fetch("/api/admin/renewals?status=pending");
        if (!res.ok) return;
        const data = await res.json();
        setRenewalCount(data.data?.length ?? 0);
      } catch {
        // Silencioso — no interrumpir la UI por un fallo en el conteo
      }
    };

    fetchRenewalCount();
    intervalRef.current = setInterval(fetchRenewalCount, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const classSessions = classesData || [];
  // Clases canceladas
  const cancelledClassCount =
    classSessions.filter((cls: any) => cls.status === "cancelled").slice(0, 3)
      .length > 0
      ? 1
      : 0;

  return renewalCount + cancelledClassCount;
}
