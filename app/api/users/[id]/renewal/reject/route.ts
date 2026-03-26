import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Obtener usuario usando el servicio real
    const userResponse = await userService.getUserById(userId);
    const user = userResponse.data;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.membership?.pendingRenewal) {
      return NextResponse.json(
        { error: "No pending renewal found" },
        { status: 400 }
      );
    }

    // Rechazar renovación
    const updatedMembership = {
      ...user.membership,
      pendingRenewal: {
        ...user.membership.pendingRenewal,
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      },
    };

    const updateResponse = await userService.updateUser(userId, { 
      membership: updatedMembership 
    } as any);

    if (!updateResponse.success) {
      throw new Error(updateResponse.error?.message || "Failed to update user");
    }

    return NextResponse.json({
      user: updateResponse.data,
      message: "Plan renewal rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting plan renewal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
