import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDataProvider } from "@/lib/data-layer/provider-factory";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params;

    const provider = getDataProvider();

    // Get the class session via repository
    const classSession = await provider.classes.findUnique({
      where: { id: classId },
    });

    if (!classSession) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if class is already cancelled
    if (classSession.status === "cancelled") {
      return NextResponse.json(
        { error: "La clase ya está cancelada" },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Cancel the class
      const updatedClassSession = await tx.classSession.update({
        where: { id: classId },
        data: { status: "cancelled" },
      });

      // 2. Refund classes to all registered participants
      const affectedUsers: string[] = [];

      for (const userId of classSession.registeredParticipantsIds) {
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        const memberData = user.membership as any;
        if (user && memberData?.planConfig?.classLimit > 0) {
          await tx.user.update({
            where: { id: userId },
            data: {
              membership: {
                ...memberData,
                centerStats: {
                  ...memberData.centerStats,
                  currentMonth: {
                    ...memberData.centerStats?.currentMonth,
                    remainingClasses: (memberData.centerStats?.currentMonth?.remainingClasses || 0) + 1,
                  },
                },
              },
            },
          });
          affectedUsers.push(userId);
        }
      }

      return { updatedClassSession, affectedUsers };
    });

    // =============================
    // EMITIR EVENTO DE WEBSOCKET
    // =============================

    try {
      // Usar la nueva API route para emitir eventos
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      await fetch(`${baseUrl}/api/emit-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: `org_${classSession.organizationId}`,
          event: "class-cancelled",
          data: {
            classId: classId,
            classSession: result.updatedClassSession,
            affectedUsers: result.affectedUsers,
            cancelledAt: new Date().toISOString(),
          },
        }),
      });

      console.log(
        `WebSocket event emitted: class-cancelled for class ${classId}`
      );
    } catch (wsError) {
      // No fallar la operación si el WebSocket falla
      console.error("Error emitting WebSocket event:", wsError);
    }

    return NextResponse.json({
      message: `Clase cancelada. Se devolvieron clases a ${result.affectedUsers.length} usuarios.`,
      class: result.updatedClassSession,
      affectedUsers: result.affectedUsers,
    });
  } catch (error) {
    console.error("Error cancelling class:", error);
    return NextResponse.json(
      { error: "Error al cancelar la clase" },
      { status: 500 }
    );
  }
}
