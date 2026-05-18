import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["cancelled", "superseded", "approved", "rejected"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; renewalId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Solo admins pueden modificar renovaciones directamente
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id: userId, renewalId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Permitidos: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Verificar que la renovación pertenece al usuario indicado
    const renewal = await prisma.membershipRenewal.findFirst({
      where: { id: renewalId, userId },
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
