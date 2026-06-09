import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 5;

/**
 * GET /api/me/history?cursor=<requestedAt_ISO>&limit=5
 *
 * Devuelve los planes contratados (MembershipRenewal con status='approved')
 * del usuario autenticado, filtrados por organizationId (multi-tenant).
 * Paginados por cursor (requestedAt desc).
 *
 * Respuesta: { success: true, data: [...], nextCursor: "<ISO>" | null }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Resolver id interno + organizationId desde organization_members
    // Boxy: la identidad es tenant-scoped; un email puede existir en varios centros.
    const dbUser = await prisma.user.findFirst({
      where: { email: { equals: user.email!, mode: "insensitive" } },
      select: {
        id: true,
        memberships: {
          select: { organizationId: true },
          take: 1,
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // organizationId: preferir el del token si requireAuth() lo expone,
    // si no, tomarlo de organization_members.
    // Si no hay ninguno, rechazar — un alumno sin centro no tiene historial válido.
    const organizationId = dbUser.memberships?.[0]?.organizationId ?? null;

    if (!organizationId) {
      return NextResponse.json(
        { error: "No se encontró organización para este usuario" },
        { status: 404 }
      );
    }

    // Parsear parámetros de paginación
    const { searchParams } = new URL(request.url);
    const cursorRaw = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10),
      50
    );

    // Cursor-based pagination: traemos limit+1 para detectar si hay más página
    const renewals = await prisma.membershipRenewal.findMany({
      where: {
        userId: dbUser.id,
        organizationId,          // ← filtro multi-tenant obligatorio en Boxy
        status: "approved",
        ...(cursorRaw
          ? { requestedAt: { lt: new Date(cursorRaw) } }
          : {}),
      },
      orderBy: { requestedAt: "desc" },
      take: limit + 1,
      select: {
        id: true,
        status: true,
        amount: true,
        startDate: true,
        requestedAt: true,
        processedAt: true,
        renewalDetails: true,
      },
    });

    const hasMore = renewals.length > limit;
    const items = hasMore ? renewals.slice(0, limit) : renewals;
    const nextCursor = hasMore
      ? items[items.length - 1].requestedAt.toISOString()
      : null;

    return NextResponse.json({ success: true, data: items, nextCursor });
  } catch (error) {
    console.error("[/api/me/history] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
