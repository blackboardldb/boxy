import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const subscription = await req.json();
    const userId = auth.user.id;

    // Verificar si ya existe esa suscripción exacta para este usuario
    // Nota: subscription es un objeto JSON
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        userId,
        subscription: {
          equals: subscription,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Subscription already exists" });
    }

    await prisma.pushSubscription.create({
      data: {
        userId,
        subscription: subscription as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { endpoint } = await req.json();
    const userId = auth.user.id;

    // Eliminar la suscripción que coincida con el endpoint del dispositivo para este usuario
    // Usamos findMany y luego delete para manejar la búsqueda en JSON
    const subs = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    const toDelete = subs.filter((s: any) => s.subscription.endpoint === endpoint);

    if (toDelete.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          id: { in: toDelete.map((d: any) => d.id) }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
