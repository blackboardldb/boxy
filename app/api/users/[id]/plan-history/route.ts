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
        status: "approved",
      },
      select: {
        id: true,
        requestedAt: true,
        processedAt: true,
        amount: true,
        paymentMethod: true,
        renewalDetails: true,
      },
      orderBy: { requestedAt: "desc" },
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
        planName,
        startDate:     details?.startDate ?? null,
        endDate,
        amount:        r.amount ?? planPrice,
        paymentMethod: r.paymentMethod ?? null,
        processedAt:   r.processedAt?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/users/[id]/plan-history]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
