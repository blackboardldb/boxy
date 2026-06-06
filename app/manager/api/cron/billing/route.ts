import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Proteger la ruta — solo manager puede lanzarlo manualmente por ahora.
    // (En un futuro si se engancha a Vercel Cron, se debe usar un header de autorización secreto).
    await requireManager();

    const hoy = new Date();
    
    // Obtener centros activos o en trial cuya fecha de expiración haya pasado
    const centrosVencidos = await prisma.organization.findMany({
      where: {
        status: { in: ['TRIAL', 'ACTIVE'] },
        billingPeriodEnd: { lt: hoy },
      },
    });

    let suspendedCount = 0;

    for (const centro of centrosVencidos) {
      await prisma.$transaction(async (tx) => {
        await tx.organization.update({
          where: { id: centro.id },
          data: {
            status: 'SUSPENDED',
            suspendedAt: hoy,
            suspendedReason: 'auto_suspended_billing',
          },
        });

        await tx.systemEvent.create({
          data: {
            organizationId: centro.id,
            type: "org_suspended",
            message: "Centro suspendido automáticamente por término de ciclo de facturación no pagado.",
          },
        });
      });
      suspendedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Cron ejecutado. Centros suspendidos: ${suspendedCount}`,
      centrosSuspendidos: centrosVencidos.map(c => c.slug),
    });
  } catch (error: any) {
    console.error("[GET /manager/api/cron/billing]", error);
    return NextResponse.json({ error: "Error al ejecutar cron" }, { status: 500 });
  }
}
