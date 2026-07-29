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
 * Envía una notificación push a un conjunto de usuarios, aislado por tenant.
 *
 * [BLINDAJE MULTI-TENANT] El filtro combina userId (in) + organizationId.
 * Esto es lo que evita que un alumno "bicentrado" (inscrito en Centro A y B)
 * reciba en el dispositivo de Centro B una alerta que canceló Centro A:
 * solo se buscan suscripciones que pertenezcan AL MISMO TIEMPO al usuario
 * afectado Y al centro que originó la acción.
 */
export async function sendToUsers(
  userIds: string[],
  organizationId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (userIds.length === 0) return { sent: 0, failed: 0 };

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: { in: userIds },
      organizationId, // <- el blindaje: nunca se manda sin este filtro
    },
    select: { id: true, subscription: true },
  });

  const pushPayload = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  const pushPromises = subscriptions.map(async (subRecord) => {
    try {
      await webpush.sendNotification(
        subRecord.subscription as unknown as webpush.PushSubscription,
        pushPayload
      );
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

  // Await obligatorio: en Serverless (Vercel) la función puede cerrarse
  // apenas se devuelve la respuesta, matando las promesas pendientes.
  await Promise.allSettled(pushPromises);

  return { sent, failed };
}

/**
 * Envía una notificación push a todos los usuarios de un centro.
 */
export async function sendToOrganization(
  organizationId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { organizationId },
    select: { id: true, subscription: true },
  });

  if (subscriptions.length === 0) return { sent: 0, failed: 0 };

  const pushPayload = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  const pushPromises = subscriptions.map(async (subRecord) => {
    try {
      await webpush.sendNotification(
        subRecord.subscription as unknown as webpush.PushSubscription,
        pushPayload
      );
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

  await Promise.allSettled(pushPromises);

  return { sent, failed };
}
