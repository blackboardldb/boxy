import { NextRequest, NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const manager = await requireManager();
    const { id } = await params;
    const org = await managerService.getById(id, manager.role);
    if (!org) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(org);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
