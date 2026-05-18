import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseKey: string }> }
) {
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
    const { exerciseKey } = await params;

    // NOTA: take: 3 con orderBy asc funciona correctamente SOLO porque
    // la lógica de POST garantiza máximo 3 filas por (userId, exerciseKey).
    // Si esa invariante falla, esta query devolvería los 3 más antiguos,
    // no primero + últimos 2. Considerar query defensiva en el futuro.
    const records = await prisma.userLift.findMany({
      where: { userId, exerciseKey },
      orderBy: { recordedAt: "asc" },
      take: 3,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching RM records:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
