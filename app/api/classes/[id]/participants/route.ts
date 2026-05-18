import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorHandler } from "@/lib/errors/handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    id = (await params).id;

    if (!id) {
      return NextResponse.json({ error: "ID de clase requerido" }, { status: 400 });
    }

    const registrations = await prisma.classRegistration.findMany({
      where: {
        classId: id,
        status: "registered",
      },
      select: {
        userId: true,
        registeredAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            // HAL-01 COMPLETO: membership JSONB eliminado → userMembership relacional
            userMembership: {
              select: { membershipType: true },
            },
          },
        },
      },
      orderBy: { registeredAt: "asc" },
    });

    // Mapear a un formato más útil para el Drawer
    const participants = registrations.map((reg) => ({
      userId: reg.user.id,
      firstName: reg.user.firstName,
      lastName: reg.user.lastName,
      email: reg.user.email,
      phone: reg.user.phone,
      membershipType: reg.user.userMembership?.membershipType ?? "Sin plan",
      bookedAt: reg.registeredAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: participants,
    });
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "getClassParticipants",
      resource: "classes",
      metadata: { id },
    });
  }
}
