import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

const schema = z.object({
  status: z.enum(["TRIAL", "ACTIVE", "SUSPENDED"]),
  reason: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await managerService.setStatus(id, parsed.data.status, parsed.data.reason);
  return NextResponse.json({ ok: true });
}
