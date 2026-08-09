import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireManager();
    const { id } = await params;

    // auth.user is assumed to be available, or we just pass the auth.id if it's there
    // If not, we'll just log "Manager" for now.
    const managerId = auth.authId || "manager"; 

    const passwords = await managerService.getDefaultPasswords(id, managerId);
    return NextResponse.json({ success: true, passwords });
  } catch (error: any) {
    console.error("[GET /manager/api/centros/[id]/passwords]", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener contraseñas" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireManager();
    const { id } = await params;

    const managerId = auth.authId || "manager";

    const passwords = await managerService.resetDefaultPasswords(id, managerId);
    return NextResponse.json({ success: true, passwords });
  } catch (error: any) {
    console.error("[POST /manager/api/centros/[id]/passwords]", error);
    return NextResponse.json(
      { error: error.message || "Error al restablecer contraseñas" },
      { status: 500 }
    );
  }
}
