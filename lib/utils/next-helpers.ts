/**
 * next-helpers.ts
 * Utilidades para interactuar con el comportamiento interno de Next.js
 */

/**
 * Re-lanza la excepción si es un redirect interno de Next.js.
 * Debe usarse dentro de bloques catch() genéricos en API Routes (ej. catch (error: any)) 
 * para evitar que Next.js pierda el control del redirect y devuelva un 500.
 * 
 * @param error El error capturado en el catch
 */
export function rethrowIfRedirect(error: any) {
  if (
    error instanceof Error &&
    typeof (error as any).digest === "string" &&
    (error as any).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}
