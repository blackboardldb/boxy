import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFast } from "@/lib/supabase/auth-guard";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Guard: Solo admin
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 2. Tenant: aislado y validado desde el token
    const activeOrgId = auth.organizationId;

    // 3. Validación de params (Next.js 15+ API)
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "El ID de la alerta es requerido" },
        { status: 400 }
      );
    }

    // 4. Eliminación atómica validando pertenencia real
    // deleteMany garantiza que solo borre si el ID y el Tenant hacen match exacto.
    // Si devuleve count 0, es porque no existe o porque le pertenece a otro tenant.
    const result = await prisma.inAppAlert.deleteMany({
      where: { 
        id, 
        organizationId: activeOrgId 
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Alerta no encontrada" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Alerta eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" }, 
      { status: 500 }
    );
  }
}
