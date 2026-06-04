import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

const schema = z.object({
  amount: z.number().int().positive(), // en centavos
  currency: z.string().length(3).default("CLP"),
  method: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  paidAt: z.string().datetime().optional(),
});

export async function POST(
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

  const payment = await managerService.registerPayment(id, {
    ...parsed.data,
    paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : undefined,
  });

  return NextResponse.json(payment, { status: 201 });
}
