import webpush from "web-push";
import { prisma } from "@/lib/prisma";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:victor@blacksheep.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface PushPayload {
  title: string;
  body: string;
  type: string;
}

/**
 * Función interna de despacho que concentra la serialización,
 * manejo de errores y limpieza (404/410) para cualquier suscripción webpush.
 */
async function dispatch(
  subscriptions: { id: string; subscription: unknown }[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const pushPayload = JSON.stringify(payload);
  let sent = 0, failed = 0;

  const results = subscriptions.map(async (subRecord) => {
    try {
      await webpush.sendNotification(subRecord.subscription as any, pushPayload);
      sent++;
    } catch (err: any) {
      failed++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.pushSubscription.delete({ where: { id: subRecord.id } });
      } else {
        console.error(`[Push Notification] Error enviando a sub ${subRecord.id}:`, err);
      }
    }
  });

  await Promise.allSettled(results);
  return { sent, failed };
}

/**
 * Envía una notificación push a un conjunto de usuarios, aislado por tenant.
 *
 * [BLINDAJE MULTI-TENANT] El filtro combina userId (in) + organizationId.
 * Esto es lo que evita que un alumno "bicentrado" (inscrito en Centro A y B)
 * reciba en el dispositivo de Centro B una alerta que canceló Centro A:
 * solo se buscan suscripciones que pertenezcan AL MISMO TIEMPO al usuario
 * afectado Y al centro que originó la acción.
 */
export async function sendToUsers(userIds: string[], organizationId: string, payload: PushPayload) {
  if (userIds.length === 0) return { sent: 0, failed: 0 };
  const subs = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds }, organizationId },
    select: { id: true, subscription: true },
  });
  return dispatch(subs, payload);
}

/**
 * Envía una notificación push a todos los usuarios de un centro.
 */
export async function sendToOrganization(organizationId: string, payload: PushPayload) {
  const subs = await prisma.pushSubscription.findMany({
    where: { organizationId },
    select: { id: true, subscription: true },
  });
  return dispatch(subs, payload);
}
