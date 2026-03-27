import { NextResponse } from "next/server";
import { generateClassesFromSchedules } from "@/lib/utils/class-generator";

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
    
    // Llamamos al generador sin parámetros para usar el default de 15 días
    const generatedClasses = await generateClassesFromSchedules();
    
    console.log(`[Cron] Generación completada con éxito. Procesadas ${generatedClasses.length} sesiones potenciales.`);

    return NextResponse.json({
      success: true,
      message: "Calendario actualizado correctamente (Ventana 15 días)",
      potentials: generatedClasses.length
    });
  } catch (error) {
    console.error("[Cron] Error en generación de clases:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}
