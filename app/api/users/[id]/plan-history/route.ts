import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users/[id]/plan-history
 *
 * Retorna el historial de planes finalizados (approved) de un alumno.
 * Solo se llama al abrir el acordeón "Historial de Planes" — carga diferida.
 *
 * Preparado para alumno: cambiar requireAdmin() por requireAuth()
 * y agregar validación: if (params.id !== auth.user.id) return 403.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: userId } = await params;
    const { organizationId } = auth;

    const { searchParams } = new URL(_request.url);
    const cursorRaw = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "5", 10),
      50
    );

    const renewals = await prisma.membershipRenewal.findMany({
      where: {
        userId,
        organizationId, // tenant scoping — filtra en SQL, no en JS
        status: { in: ["approved", "scheduled"] },
        ...(cursorRaw ? { requestedAt: { lt: new Date(cursorRaw) } } : {}),
      },
      select: {
        id: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        amount: true,
        paymentMethod: true,
        renewalDetails: true,
      },
      // scheduled primero, luego approved por fecha desc
      orderBy: [{ requestedAt: "desc" }],
      take: limit + 1,
    });

    const hasMore = renewals.length > limit;
    const itemsRaw = hasMore ? renewals.slice(0, limit) : renewals;
    const nextCursor = hasMore ? itemsRaw[itemsRaw.length - 1].requestedAt.toISOString() : null;

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
        startDate:     details?.startDate ?? null,
        endDate,
        amount:        r.amount ?? planPrice,
        paymentMethod: r.paymentMethod ?? null,
        processedAt:   r.processedAt?.toISOString() ?? null,
      };
    });

    // Ordenar: scheduled al tope, luego el resto por requestedAt desc
    data.sort((a, b) => {
      if (a.status === "scheduled" && b.status !== "scheduled") return -1;
      if (a.status !== "scheduled" && b.status === "scheduled") return 1;
      return 0;
    });

    // Deduplicar por (planName + startDate):
    // — El sort anterior pone scheduled primero, así que si hay un scheduled y un
    //   approved para el mismo plan, el scheduled gana (se muestra con badge Programado)
    //   y el approved se descarta como duplicado.
    // — Post-promoción (scheduled → approved), ambos son approved y el de requestedAt
    //   más reciente (el pago, creado después) gana y muestra el monto correcto.
    const seen = new Set<string>();
    const deduplicated = data.filter((item) => {
      const key = `${item.planName}|${item.startDate ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ success: true, data: deduplicated, nextCursor });
  } catch (error) {
    console.error("[GET /api/users/[id]/plan-history]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
