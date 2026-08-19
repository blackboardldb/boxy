import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPlanSchema = z.object({
  name: z.string().min(1).max(50),
  maxActiveStudents: z.number().int().positive(),
  priceMonthly: z.number().int().min(0).optional().default(0),
});

export async function GET() {
  try {
    await requireManager();
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { organizations: true } } },
    });
    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireManager();
    const body = await req.json();
    const parsed = createPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const existing = await prisma.plan.findUnique({ where: { name: parsed.data.name } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un plan con ese nombre." }, { status: 409 });
    }

    const plan = await prisma.plan.create({ 
      data: parsed.data,
      include: { _count: { select: { organizations: true } } }
    });
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
  }
}
