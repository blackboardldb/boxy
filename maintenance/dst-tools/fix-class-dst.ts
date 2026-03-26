
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Retorna la representación local de una fecha en Santiago de Chile
 */
function getSantiagoTimeStr(date: Date): { hh: string; mm: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  
  const hh = parts.find(p => p.type === "hour")?.value || "00";
  const mm = parts.find(p => p.type === "minute")?.value || "00";
  
  return { hh, mm };
}

async function fixClassTimes() {
  const filterDate = process.argv[2]; // Opcional: "2026-04-06"
  
  console.log("=== Corrigiendo horarios por cambio de DST (Chile) - IDEMPOTENTE ===");
  if (filterDate) console.log(`MODO: Filtrando solo para la fecha ${filterDate}`);
  
  // Cutoff date is midnight April 5th, 2026 (when DST ends in Chile)
  const cutoffDate = new Date("2026-04-05T00:00:00Z");
  
  try {
    const classes = await prisma.classSession.findMany({
      where: {
        dateTime: { gte: cutoffDate },
        status: { not: "cancelled" },
        ...(filterDate ? { id: { startsWith: `cls_${filterDate}` } } : {})
      }
    });

    console.log(`Se encontraron ${classes.length} clases para evaluar.`);

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const session of classes) {
      // 1. Extraer hora objetivo del ID (cls_YYYY-MM-DD_HHmm_...)
      const match = session.id.match(/^cls_\d{4}-\d{2}-\d{2}_(\d{2})(\d{2})_/);
      
      if (!match) {
        console.log(`[!] Clase ${session.id}: ID no sigue el patrón estándar. Saltando para seguridad.`);
        skippedCount++;
        continue;
      }

      const targetHH = match[1];
      const targetMM = match[2];

      // 2. Ver hora actual en Santiago para ese UTC
      const current = getSantiagoTimeStr(session.dateTime);

      // 3. Comparar
      if (current.hh === targetHH && current.mm === targetMM) {
        // Ya está correcto.
        skippedCount++;
        continue;
      }

      // Si la hora actual es 1 hora MENOS que el objetivo, sumamos 1 hora
      // (Ejemplo: actual 04:45 vs objetivo 05:45)
      const currentVal = parseInt(current.hh) * 60 + parseInt(current.mm);
      const targetVal = parseInt(targetHH) * 60 + parseInt(targetMM);

      // Calcular diferencia (manejando cambio de día)
      let diff = targetVal - currentVal;
      if (diff < 0) diff += 1440; // Por si cruza medianoche

      // El desfase debe ser de exactamente 60 minutos para ser un error de DST (-03 vs -04)
      if (diff === 60) {
        const newTime = new Date(session.dateTime.getTime() + 3600000);
        
        await prisma.classSession.update({
          where: { id: session.id },
          data: { dateTime: newTime }
        });
        
        console.log(`[FIX] ${session.id}: ${current.hh}:${current.mm} -> ${targetHH}:${targetMM} OK`);
        fixedCount++;
      } else {
        console.log(`[?] ${session.id}: Desfase no estándar (${current.hh}:${current.mm} != ${targetHH}:${targetMM}). Saltando.`);
        errorCount++;
      }
    }

    console.log("\n--- RESULTADO ---");
    console.log(`Fijadas:    ${fixedCount}`);
    console.log(`Saltadas:   ${skippedCount} (ya estaban bien o ID no estándar)`);
    console.log(`Dudosas:    ${errorCount}`);
    console.log("-----------------");

  } catch (error) {
    console.error("Error corrigiendo clases:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixClassTimes();
