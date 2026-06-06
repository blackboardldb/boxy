import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;
    const body = await req.json();
    
    const { amount, currency, method, notes, paidAt } = body;
    
    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: "El monto es requerido" }, { status: 400 });
    }
    
    const payment = await managerService.registerPayment(id, {
      amount: parseInt(amount, 10), // amount debe venir en centavos
      currency,
      method,
      notes,
      paidAt: paidAt ? new Date(paidAt) : undefined,
    });
    
    return NextResponse.json(payment);
  } catch (error: any) {
    console.error("[POST /manager/api/centros/[id]/billing]", error);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}
