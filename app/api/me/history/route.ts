import { NextResponse } from "next/server";

export async function GET() {
  // HAL-01 COMPLETO: membership.history era JSONB — columna eliminada.
  // Decisión arquitectónica: history[] no se migra. El historial oficial está en MembershipRenewal.
  // Este endpoint puede evolucionar a leer de /api/admin/renewals si se requiere historial en la UI.
  return NextResponse.json({ success: true, data: [] });
}
