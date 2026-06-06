import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await managerService.updateInfo(id, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PATCH /manager/api/centros/[id]/info]", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar centro" },
      { status: 500 }
    );
  }
}
