import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

export async function GET() {
  try {
    await requireManager();
    const orgs = await managerService.listAll();
    return NextResponse.json(orgs);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
