import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { z } from "zod";

// =============================
// SCHEMA
// =============================

const emitEventSchema = z.object({
  room: z.string().min(1, "room es requerido"),
  event: z.string().min(1, "event es requerido"),
  data: z.unknown().optional(),
});

// =============================
// HANDLER PRINCIPAL
// =============================

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const parsed = emitEventSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { room, event, data } = parsed.data;

    // Por ahora, simplemente loguear el evento
    // En una implementación real, aquí se emitiría el evento WebSocket
    console.log(`Event emitted: ${event} to room: ${room}`, data);

    return NextResponse.json({
      success: true,
      message: `Event ${event} emitted to room ${room}`,
    });
  } catch (error) {
    console.error("Error emitting event:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
