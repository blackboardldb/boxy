import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// MIGRACIÓN: Este endpoint usaba la tabla legacy `profiles` (pre-multi-tenant, docs/historico/).
// La tabla no existe en el schema Prisma actual de Boxy. El endpoint fallaba con 403 siempre.
// Migrado a requireAdmin() (organization_members, roles ADMIN/COACH, con organizationId).
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { z } from "zod";

const patchRenewalSchema = z.object({
  status: z.enum(["cancelled", "superseded", "approved", "rejected"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; renewalId: string }> }
) {
  try {
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: userId, renewalId } = await params;
    const parsed = patchRenewalSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { status } = parsed.data;

    // Verificar que la renovación pertenece al usuario indicado y al centro del admin
    const renewal = await prisma.membershipRenewal.findFirst({
      where: { 
        id: renewalId, 
        userId,
        organizationId: auth.organizationId 
      },
    });

    if (!renewal) {
      return NextResponse.json({ error: "Renovación no encontrada" }, { status: 404 });
    }

    const updated = await prisma.membershipRenewal.update({
      where: { id: renewalId },
      data: { status, processedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /api/users/[id]/renewal/[renewalId]] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
