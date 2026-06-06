import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";
import type { OrgStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;
    const org = await managerService.getById(id);
    
    if (!org) {
      return NextResponse.json({ error: "Centro no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(org);
  } catch (error: any) {
    console.error("[GET /manager/api/centros/[id]]", error);
    return NextResponse.json({ error: "Error al obtener centro" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;
    const body = await req.json();
    
    const { status, reason } = body as { status: OrgStatus; reason?: string };
    
    if (!status) {
      return NextResponse.json({ error: "El estado es requerido" }, { status: 400 });
    }
    
    if (status === "SUSPENDED" && !reason) {
      return NextResponse.json({ error: "El motivo es requerido para suspender" }, { status: 400 });
    }
    
    await managerService.setStatus(id, status, reason);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PATCH /manager/api/centros/[id]]", error);
    return NextResponse.json({ error: error.message || "Error al actualizar estado" }, { status: 500 });
  }
}
