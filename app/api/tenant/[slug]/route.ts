import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint interno para que el middleware resuelva el tenant por slug.
 * Protegido con MIDDLEWARE_SECRET para que no sea público.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Verificar secreto interno
  const secret = request.headers.get("x-middleware-secret");
  if (secret !== (process.env.MIDDLEWARE_SECRET ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        suspendedReason: true,
        themePrimaryColor: true,
        themeVariant: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error("[/api/tenant] Error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 503 });
  }
}
