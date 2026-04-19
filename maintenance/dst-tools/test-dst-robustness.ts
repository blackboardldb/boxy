import { getChileOffset, localToUTC, formatDateChile, formatTimeChile } from "../../lib/utils"; // HAL-15: path corregido (era ../lib/utils)

// Lista de fechas críticas para probar transiciones de DST en Chile 2026
const testDates = [
  // 1. Transición Verano -> Invierno (Abril 2026)
  // En Chile continental, el sábado 4 de abril a las 23:59:59 pasa a ser 23:00:00 (se atrasa 1 hora)
  { localDate: "2026-04-04", time: "20:00", description: "Sábado antes del cambio (Verano -03)" },
  { localDate: "2026-04-05", time: "05:45", description: "Domingo inicio invierno (Invierno -04)" },
  { localDate: "2026-04-06", time: "20:00", description: "Lunes invierno (Invierno -04)" },

  // 2. Transición Invierno -> Verano (Septiembre 2026)
  // El primer sábado de septiembre a las 23:59:59 pasa a ser 01:00:00 del domingo (se adelanta 1 hora)
  // El primer sábado de septiembre 2026 es el 5 de septiembre.
  { localDate: "2025-09-06", time: "20:00", description: "Sábado antes del cambio (Invierno -04)" },
  { localDate: "2025-09-07", time: "05:45", description: "Domingo inicio verano (Verano -03)" },
  { localDate: "2025-09-08", time: "20:00", description: "Lunes verano (Verano -03)" },
];

console.log("=== PRUEBA DE ROBUSTEZ DST CHILE (America/Santiago) ===\n");

testDates.forEach((test) => {
  const d = new Date(`${test.localDate}T12:00:00`);
  const offset = getChileOffset(d);
  const utc = localToUTC(d, test.time);
  
  // Verificar la inversa (cómo lo vería el frontend después de recuperarlo de la BD)
  const displayDate = formatDateChile(utc);
  const displayTime = formatTimeChile(utc);

  console.log(`DESCRIPCIÓN: ${test.description}`);
  console.log(`Entrada Local:  ${test.localDate} ${test.time}`);
  console.log(`Offset Detectado: ${offset}`);
  console.log(`Guardado en BD:  ${utc}`);
  console.log(`Recuperado UI:   ${displayDate} ${displayTime}`);
  
  const isCorrect = `${test.localDate} ${test.time}` === `${displayDate} ${displayTime}`;
  console.log(`ESTADO: ${isCorrect ? "✅ OK - Coincidencia Perfecta" : "❌ ERROR - Descalce"}`);
  console.log("--------------------------------------------------\n");
});

console.log("CONCLUSIÓN:");
console.log("El uso de 'Intl.DateTimeFormat' con 'America/Santiago' delega las reglas");
console.log("cambiantes de Chile al motor de JS, garantizando compatibilidad futura.");
