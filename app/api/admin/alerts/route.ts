import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { sendToOrganization } from "@/lib/services/push-service";
import { createInAppAlertSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
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
    const auth = await requireAdminFast(req);
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

    const shouldSendPush = type === "cancelacion" || sendPush === true;

    if (shouldSendPush) {
      try {
        // Alerta general del centro: se manda a todas las suscripciones del tenant
        await sendToOrganization(auth.organizationId, {
          title: alert.title,
          body: alert.content,
          type: alert.type,
        });
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
