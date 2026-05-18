import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createLiftSchema = z.object({
  exerciseKey: z.string(),
  weight: z.number().positive(),
  unit: z.enum(["kg", "lbs"]),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: { email: { equals: user.email, mode: "insensitive" } },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser.id;
    const organizationId = dbUser.organizationId;

    const body = await req.json();
    const result = createLiftSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", details: result.error }, { status: 400 });
    }

    const { exerciseKey, weight, unit } = result.data;

    const lift = await prisma.$transaction(async (tx) => {
      const existing = await tx.userLift.findMany({
        where: { userId, exerciseKey },
        orderBy: { recordedAt: "asc" },
        select: { id: true },
      });

      if (existing.length >= 3) {
        const toDelete = existing.slice(1, -1);
        await tx.userLift.deleteMany({
          where: { id: { in: toDelete.map((r: any) => r.id) } },
        });
      }

      return tx.userLift.create({
        data: {
          userId,
          organizationId,
          exerciseKey,
          weight,
          unit,
          recordedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true, data: lift });
  } catch (error) {
    console.error("Error creating RM lift:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
