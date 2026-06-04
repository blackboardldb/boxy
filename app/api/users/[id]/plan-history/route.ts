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

    const renewals = await prisma.membershipRenewal.findMany({
      where: {
        userId,
        organizationId, // tenant scoping — filtra en SQL, no en JS
        status: { in: ["approved", "scheduled"] },
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
    });

    // Mapear renewalDetails (JSONB) a campos planos — nunca exponer el JSON crudo al cliente.
    // Existen dos formatos según el origen del renewal:
    //   A) Creado por /api/users/[id]/renewal → { requestedPlanName, requestedPlanPrice, requestedPlanDuration, startDate }
    //   B) Creado por user-repository (plan futuro) → { membershipType, monthlyPrice, startDate, endDate }
    const data = renewals.map((r) => {
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

    // Deduplicar por (status + planName + startDate):
    // — scheduled y approved del mismo plan son entradas distintas (hasta que se promueve)
    // — dos approved del mismo plan (post-promoción) se deduplicar normalmente
    const seen = new Set<string>();
    const deduplicated = data.filter((item) => {
      const statusKey = item.status === "scheduled" ? "scheduled" : "approved";
      const key = `${statusKey}|${item.planName}|${item.startDate ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ success: true, data: deduplicated });
  } catch (error) {
    console.error("[GET /api/users/[id]/plan-history]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
