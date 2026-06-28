import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { z } from "zod";

// HAL-01 Fase 4 Sprint 1.4: Rechaza la renovación pendiente actualizando directamente
// la tabla MembershipRenewal. Ya no lee ni escribe en el JSONB membership.

const rejectRenewalSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id;  // Next.js 15: params es una Promise

    // Guard de autenticación — solo admins pueden rechazar renovaciones
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const orgId = auth.organizationId;

    const parsed = rejectRenewalSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const reason: string = parsed.data?.reason ?? "Rechazado por administrador";

    // Verificar que el usuario existe
    const userResponse = await userService.getUserById(userId);
    if (!userResponse.data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Buscar la renovación pendiente más reciente SCOPED al centro del admin
    const pendingRenewal = await prisma.membershipRenewal.findFirst({
      where: {
        userId,
        status: "pending",
        organizationId: orgId,
      },
      orderBy: { requestedAt: "desc" },
    });

    if (!pendingRenewal) {
      return NextResponse.json(
        { error: "No pending renewal found" },
        { status: 400 }
      );
    }

    // Actualizar estado en tabla MembershipRenewal — fuente de verdad relacional
    await prisma.membershipRenewal.update({
      where: { id: pendingRenewal.id },
      data: {
        status: "rejected",
        processedAt: new Date(),
        notes: reason,
      },
    });

    // Re-fetch usuario actualizado para la respuesta
    const updatedUserResponse = await userService.getUserById(userId);

    return NextResponse.json({
      user: updatedUserResponse.data,
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
