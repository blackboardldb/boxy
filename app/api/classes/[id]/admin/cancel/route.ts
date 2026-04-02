import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId } = await request.json();
    const { id: classId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const classSession = await prisma.classSession.findUnique({ where: { id: classId } });
    if (!classSession) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.classRegistration.update({
        where: { userId_classId: { userId, classId } },
        data: { status: "cancelled", cancelledAt: new Date() },
      });

      await tx.classSession.update({
        where: { id: classId },
        data: {
          registeredParticipantsIds: classSession.registeredParticipantsIds.filter(id => id !== userId),
          waitlistParticipantsIds: classSession.waitlistParticipantsIds.filter(id => id !== userId),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing student (admin):", error);
    return NextResponse.json({ error: error?.message || "Error al remover alumno" }, { status: 500 });
  }
}