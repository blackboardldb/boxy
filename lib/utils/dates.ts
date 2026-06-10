/**
 * lib/utils/dates.ts
 *
 * Utilidades de normalización de fechas para operaciones de membresía.
 *
 * PROBLEMA RESUELTO:
 *   Construir `new Date(someDate.toISOString().split('T')[0] + "T00:00:00")`
 *   produce un timestamp en hora LOCAL del servidor (UTC-4 en desarrollo,
 *   UTC+0 en Vercel). Comparar ese valor contra un timestamp guardado en DB
 *   que fue construido con otro offset produce "no match" → se crea un renewal
 *   nuevo en lugar de actualizar el existente.
 *
 *   `toMidnightUTC` garantiza siempre `T00:00:00.000Z` (UTC), invariante
 *   entre entornos de ejecución.
 */

/**
 * Normaliza cualquier fecha a medianoche UTC (T00:00:00.000Z).
 *
 * - Si recibe `null` o `undefined`, retorna `null`.
 * - Si recibe un `string`, extrae solo los 10 primeros caracteres (YYYY-MM-DD).
 * - Si recibe un `Date`, usa `.toISOString()` para extraer la parte de fecha.
 *
 * @example
 *   toMidnightUTC("2025-05-20T14:30:00-04:00") // → 2025-05-20T00:00:00.000Z
 *   toMidnightUTC(new Date("2025-05-20"))        // → 2025-05-20T00:00:00.000Z
 *   toMidnightUTC(null)                          // → null
 */
export function toMidnightUTC(
  date: Date | string | null | undefined
): Date | null {
  if (!date) return null;
  const dateStr =
    typeof date === "string"
      ? date.substring(0, 10)
      : date.toISOString().split("T")[0];
  return new Date(dateStr + "T00:00:00.000Z");
}

/**
 * Extrae la parte de fecha (YYYY-MM-DD) de cualquier valor de fecha.
 * Alias tipado de la lógica ya existente en user-repository.ts → toDateStr().
 *
 * @example
 *   toDateString(new Date("2025-05-20T14:30:00-04:00")) // → "2025-05-20"
 *   toDateString("2025-05-20T00:00:00.000Z")            // → "2025-05-20"
 */
export function toDateString(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.substring(0, 10);
  return value.toISOString().split("T")[0];
}
