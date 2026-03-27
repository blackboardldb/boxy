import { prisma } from "../lib/prisma";

/**
 * ONE-SHOT CLEANUP SCRIPT
 * 
 * Este script elimina las sesiones futuras que quedaron fuera de la nueva 
 * ventana móvil de 15 días y que no tienen alumnos inscritos.
 * 
 * Uso: Ejecutar manualmente desde el servidor o consola de Prisma.
 */
async function oneShotCleanup() {
  console.log("--- Iniciando Limpieza Única de Transición ---");

  // Calcular el umbral (Hoy + 15 días)
  const thresholdDate = new Date();
  thresholdDate.setHours(0, 0, 0, 0);
  thresholdDate.setDate(thresholdDate.getDate() + 15);

  console.log(`Buscando sesiones >= ${thresholdDate.toISOString()} sin inscritos...`);

  try {
    const result = await prisma.classSession.deleteMany({
      where: {
        dateTime: { gte: thresholdDate },
        registeredParticipantsIds: { equals: [] },
        // isGenerated: true // Usar si el campo existe en tu DB
      }
    });

    console.log(`✅ Limpieza completada con éxito.`);
    console.log(`📊 Sesiones excedentes eliminadas: ${result.count}`);
    
    // Contar cuántas sesiones quedaron (con alumnos) para aviso
    const remainingCount = await prisma.classSession.count({
      where: {
        dateTime: { gte: thresholdDate },
        NOT: { registeredParticipantsIds: { equals: [] } }
      }
    });

    if (remainingCount > 0) {
      console.log(`⚠️ Aviso: Quedan ${remainingCount} sesiones futuras que NO se borraron porque tienen alumnos inscritos. Deberás gestionarlas manualmente o esperar a que pasen.`);
    }

  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar
oneShotCleanup();
