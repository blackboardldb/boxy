import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;
    const body = await request.json();
    // body contains renewalId if needed, but the current logic just toggles membership status

    // Buscar usuario usando el servicio real
    const userResponse = await userService.getUserById(userId);
    const user = userResponse.data;

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    if (!user.membership || user.membership.status !== "pending") {
      return NextResponse.json(
        { error: "El usuario no está pendiente de aprobación" },
        { status: 400 }
      );
    }

    // Actualizar el estado de la membresía a 'active' y la fecha de inicio
    const updatedMembership = {
      ...user.membership,
      status: "active",
     startDate: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date()),
currentPeriodStart: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date()),
    };

    // (Opcional) Actualizar currentPeriodEnd según lógica de tu app

    const updateResponse = await userService.updateUser(userId, {
      membership: updatedMembership
    } as any);

    if (!updateResponse.success) {
      throw new Error(updateResponse.error?.message || "Failed to update user");
    }

    const updatedUser = updateResponse.data;

    // Emitir evento de WebSocket (simulado)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    try {
      await fetch(`${baseUrl}/api/emit-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: `org_${updatedUser.membership?.organizationId}`,
          event: "membership-status-changed",
          data: {
            userId: updatedUser.id,
            newStatus: "active",
            user: updatedUser,
          },
        }),
      });
    } catch (fetchError) {
      console.warn("Failed to emit event:", fetchError);
      // Don't fail the whole request if event emission fails
    }

    return NextResponse.json({
      message: "Usuario aprobado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
