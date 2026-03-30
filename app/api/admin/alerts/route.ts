import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import webpush from "web-push";

// Configurar web-push
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:victor@blacksheep.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function GET() {
  try {
    // Autenticación y Autorización
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const alerts = await prisma.inAppAlert.findMany({
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

    const body = await req.json();
    const { title, content, type, startDate, endDate, sendPush } = body;

    const alert = await prisma.inAppAlert.create({
      data: {
        title,
        content,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    // Lógica para enviar Push Notifications
    const isCancellation = type === "cancelacion";
    const shouldSendPush = isCancellation || sendPush === true;

    if (shouldSendPush) {
      try {
        // 1. Obtener todas las suscripciones
        const subscriptions = await prisma.pushSubscription.findMany();

        const pushPayload = JSON.stringify({
          title: alert.title,
          body: alert.content,
          type: alert.type
        });

        // 2. Enviar a cada una de forma concurrente pero resiliente
        const pushPromises = subscriptions.map(async (subRecord: any) => {
          try {
            await webpush.sendNotification(
              subRecord.subscription as any,
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

        // No bloqueamos completamente el retorno de la API si las push tardan un poco
        // Pero usamos settle para asegurar que intentamos todas
        Promise.allSettled(pushPromises);
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

