import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePlanSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  maxActiveStudents: z.number().int().positive().optional(),
  priceMonthly: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;
    const body = await req.json();
    const parsed = updatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    if (parsed.data.name) {
      const dup = await prisma.plan.findFirst({
        where: { name: parsed.data.name, id: { not: id } },
      });
      if (dup) {
        return NextResponse.json({ error: "Ya existe un plan con ese nombre." }, { status: 409 });
      }
    }

    // IMPORTANTE: este UPDATE nunca toca Organization.saasPlanLimit de los centros asignados.
    // Los centros que ya tienen este plan mantienen su snapshot inmutable, 
    // garantizando que no les cambie el límite retroactivamente.
    const plan = await prisma.plan.update({ 
      where: { id }, 
      data: parsed.data,
      include: { _count: { select: { organizations: true } } }
    });
    return NextResponse.json({ success: true, data: plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}

// DELETE explícitamente excluido.
// Motivo: Integridad referencial. Un plan puede estar asignado a centros (saasPlanId). 
// Si se borra, se rompería la relación. 
// Para desactivar un plan, se debe usar isActive: false mediante PUT.
