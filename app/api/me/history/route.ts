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
    const itemsRaw = hasMore ? renewals.slice(0, limit) : renewals;
    const nextCursor = hasMore
      ? itemsRaw[itemsRaw.length - 1].requestedAt.toISOString()
      : null;

    const data = itemsRaw.map((r) => {
      const details = r.renewalDetails as {
        // Formato A
        requestedPlanName?:       string;
        requestedPlanPrice?:      number;
        requestedPlanDuration?:   number;
        // Formato B
        membershipType?:          string;
        monthlyPrice?:            number;
        endDate?:                 string | null;
        // Común a ambos
        startDate?:               string | null;
      } | null;

      const planName  = details?.requestedPlanName  ?? details?.membershipType  ?? "Plan";
      const planPrice = details?.requestedPlanPrice ?? details?.monthlyPrice    ?? null;

      // endDate: disponible en formato B directo, o calculada desde duration en formato A
      let endDate: string | null = details?.endDate ?? null;
      if (!endDate && details?.startDate && details?.requestedPlanDuration) {
        try {
          const start = new Date(details.startDate + "T00:00:00");
          start.setMonth(start.getMonth() + Number(details.requestedPlanDuration));
          start.setDate(start.getDate() - 1); // último día del período
          endDate = start.toISOString().split("T")[0];
        } catch {
          endDate = null;
        }
      }

      return {
        id:            r.id,
        status:        r.status,
        planName,
        startDate:     details?.startDate ?? r.startDate?.toISOString()?.split("T")?.[0] ?? null,
        endDate,
        amount:        r.amount ?? planPrice,
        processedAt:   r.processedAt?.toISOString() ?? null,
      };
    });

    // Deduplicar por (planName + startDate):
    const seen = new Set<string>();
    const deduplicated = data.filter((item) => {
      const key = `${item.planName}|${item.startDate ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ success: true, data: deduplicated, nextCursor });
  } catch (error) {
    console.error("[/api/me/history] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
