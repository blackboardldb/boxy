import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
