import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import webpush from "web-push";
import { createInAppAlertSchema } from "@/lib/schemas";

// Configurar web-push (solo si existen las llaves para evitar quebrar el build de Vercel)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:victor@blacksheep.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function GET() {
  try {
    // Autenticación y Autorización
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // [BUG-ALERT-03] Filtrar por organizationId — sin esto el admin veía alertas de todos los centros.
    // organizationId es String? en el schema (null = alerta global del sistema);
    // el panel de gestión solo muestra las del propio centro.
    const alerts = await prisma.inAppAlert.findMany({
      where: { organizationId: auth.organizationId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Autenticación y Autorización
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const parsed = createInAppAlertSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { title, content, type, startDate, endDate, sendPush } = parsed.data;

    // [BUG-ALERT-02] Guardar organizationId para aislar la alerta al centro que la publica.
    // Sin esto queda null y el filtro del GET no puede discriminar por tenant.
    const alert = await prisma.inAppAlert.create({
      data: {
        title,
        content,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        organizationId: auth.organizationId,
      },
    });

    // Lógica para enviar Push Notifications
    const isCancellation = type === "cancelacion";
    const shouldSendPush = isCancellation || sendPush === true;

    if (shouldSendPush) {
      try {
        // 1. Obtener suscripciones del propio centro — [BUG-ALERT-02] sin este filtro
        // se enviaban push a alumnos de otros centros.
        const subscriptions = await prisma.pushSubscription.findMany({
          where: { organizationId: auth.organizationId },
          select: { id: true, subscription: true },
        });

        const pushPayload = JSON.stringify({
          title: alert.title,
          body: alert.content,
          type: alert.type
        });

        // 2. Enviar a cada una de forma concurrente pero resiliente
        const pushPromises = subscriptions.map(async (subRecord: any) => {
          try {
            await webpush.sendNotification(
              subRecord.subscription as unknown as webpush.PushSubscription,
              pushPayload
            );
          } catch (err: any) {
            // 3. Si dispositivo desuscrito (410 o 404), eliminar de DB
            if (err.statusCode === 410 || err.statusCode === 404) {
              await prisma.pushSubscription.delete({ where: { id: subRecord.id } });
            } else {
              console.error(`[Push Notification] Error enviando a sub ${subRecord.id}:`, err);
            }
          }
        });

        // [BUG-ALERT-02] await es obligatorio en Serverless (Vercel) — sin él la función
        // se cierra antes de que los envíos se resuelvan y se pierden notificaciones.
        await Promise.allSettled(pushPromises);
      } catch (pushErr) {
        console.error("Error en flujo de Push Notifications:", pushErr);
      }
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

