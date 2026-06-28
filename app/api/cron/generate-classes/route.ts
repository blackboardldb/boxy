import { NextResponse } from "next/server";
import { generateClassesFromSchedules } from "@/lib/utils/class-generator";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint de Cron para Vercel
 * Se ejecuta semanalmente para asegurar la ventana móvil de 15 días.
 */
export async function GET(request: Request) {
  // 1. Verificación de Seguridad (CRON_SECRET)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log("[Cron] Iniciando generación semanal de clases (Ventana 15 días)...");
    
    // 2. Traer solo centros operativos
    const orgs = await prisma.organization.findMany({
      where: { status: { in: ['ACTIVE', 'TRIAL'] } },
      select: { id: true, name: true }
    });

    // 3. Por cada centro, generar sus clases
    const results = [];
    let totalGenerated = 0;

    for (const org of orgs) {
      try {
        const generatedClasses = await generateClassesFromSchedules(org.id);
        results.push({ orgId: org.id, name: org.name, status: 'ok', count: generatedClasses.length });
        totalGenerated += generatedClasses.length;
      } catch (error) {
        console.error(`[Cron] Error generando clases para centro ${org.id}:`, error);
        results.push({ orgId: org.id, name: org.name, status: 'error', error: error instanceof Error ? error.message : "Unknown error" });
        // No lanzar — un centro que falla no debe cortar el resto
      }
    }
    
    console.log(`[Cron] Generación completada con éxito. Procesadas ${totalGenerated} sesiones potenciales en ${orgs.length} centros.`);

    return NextResponse.json({
      success: true,
      message: "Calendario actualizado correctamente (Ventana 15 días)",
      potentials: totalGenerated,
      processed: orgs.length,
      results
    });
  } catch (error) {
    console.error("[Cron] Error en generación de clases:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}
