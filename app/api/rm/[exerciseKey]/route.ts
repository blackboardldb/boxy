import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFast } from "@/lib/supabase/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ exerciseKey: string }> }
) {
  try {
    const auth = await requireAuthFast(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId } = auth;

    const dbUser = await prisma.user.findFirst({
      where: { email: { equals: auth.user.email!, mode: "insensitive" } },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser.id;
    const { exerciseKey } = await params;

    // NOTA: take: 3 con orderBy asc funciona correctamente SOLO porque
    // la lógica de POST garantiza máximo 3 filas por (userId, exerciseKey, organizationId).
    // Si esa invariante falla, esta query devolvería los 3 más antiguos,
    // no primero + últimos 2. Considerar query defensiva en el futuro.
    const records = await prisma.userLift.findMany({
      where: { userId, exerciseKey, organizationId },
      orderBy: { recordedAt: "asc" },
      take: 3,
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching RM records:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
