import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { z } from "zod";

const adminCancelSchema = z.object({
  userId: z.string().min(1, "userId es requerido"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: classId } = await params;

    const parsed = adminCancelSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { userId } = parsed.data;

    const classSession = await prisma.classSession.findUnique({ where: { id: classId } });
    if (!classSession) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.classRegistration.update({
        where: { userId_classId: { userId, classId } },
        data: { status: "cancelled", cancelledAt: new Date() },
      });

      // HAL-03 Sprint B: ya no escribimos en la columna array.
      await tx.classSession.findUnique({
        where: { id: classId },
        include: { registrations: { select: { userId: true, status: true } } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing student (admin):", error);
    return NextResponse.json({ error: error?.message || "Error al remover alumno" }, { status: 500 });
  }
}