import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { ErrorHandler } from "@/lib/errors/handler";
import { z } from "zod";

const adminCancelSchema = z.object({
  userId: z.string().min(1, "userId es requerido"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let classId = "unknown";
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const activeOrgId = request.headers.get("x-organization-id");
    if (!activeOrgId) {
      return NextResponse.json({ error: "Tenant no resuelto" }, { status: 400 });
    }

    classId = (await params).id;

    const parsed = adminCancelSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { userId } = parsed.data;

    const classSession = await prisma.classSession.findFirst({ where: { id: classId, organizationId: activeOrgId } });
    if (!classSession) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.classRegistration.update({
        where: { userId_classId: { userId, classId } },
        data: { status: "cancelled", cancelledAt: new Date() },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "adminCancelRegistration",
      resource: "classes",
      metadata: { classId },
    });
  }
}