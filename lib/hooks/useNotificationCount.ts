import { useMemo } from "react";
import { useBlackSheepStore } from "@/lib/blacksheep-store";

export function useNotificationCount() {
  const { classSessions, users } = useBlackSheepStore();

  const notificationCount = useMemo(() => {
    // Collect stats from currently loaded users
    const allUsers = users || [];

    if (!allUsers || allUsers.length === 0) {
      return 0;
    }

    let count = 0;

    // Usuarios pendientes de aprobación (nuevos registros)
    const pendingUsers = allUsers.filter(
      (user) => user.membership?.status === "pending"
    );
    count += pendingUsers.length;

    // Usuarios con renovaciones pendientes
    const renewalUsers = allUsers.filter(
      (user) =>
        user.membership?.pendingRenewal &&
        user.membership.pendingRenewal.status === "pending"
    );
    count += renewalUsers.length;

    // Clases canceladas recientes (últimas 3)
    const cancelledClasses =
      classSessions?.filter((cls) => cls.status === "cancelled").slice(0, 3) ||
      [];
    if (cancelledClasses.length > 0) {
      count += 1; // Contamos las clases canceladas como 1 notificación grupal
    }

    return count;
  }, [classSessions, users]);

  return notificationCount;
}
