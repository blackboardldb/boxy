/**
 * Sentry integration helper — punto central de captura para el servidor.
 *
 * Reglas de filtrado (qué NO enviar a Sentry):
 *  - Errores 4xx (401, 403, 404, 400, 409): son flujo normal de negocio.
 *  - ZodError: validación esperada en inputs de usuario.
 *  - AbortError: fetch cancelado por el cliente (navegación, timeout voluntario).
 *  - MonitoredError LOW / MEDIUM: no requieren atención inmediata.
 *
 * Qué SÍ se captura:
 *  - Errores 5xx (InternalError, errores Prisma no mapeados, etc.)
 *  - MonitoredError HIGH → Sentry level "warning"
 *  - MonitoredError CRITICAL → Sentry level "fatal"
 *  - Error genérico / unknown no capturado por AppError
 */

import * as Sentry from "@sentry/nextjs";
import { AppError, MonitoredError, ErrorSeverity, ErrorContext } from "../errors/types";

/** Mapeo de ErrorSeverity → nivel de Sentry */
const SEVERITY_TO_SENTRY: Record<ErrorSeverity, Sentry.SeverityLevel> = {
  [ErrorSeverity.LOW]:      "info",
  [ErrorSeverity.MEDIUM]:   "warning",
  [ErrorSeverity.HIGH]:     "warning",
  [ErrorSeverity.CRITICAL]: "fatal",
};

/** Tipos de error que nunca deben ir a Sentry */
function shouldIgnore(error: unknown): boolean {
  // AbortError — fetch cancelado por el cliente
  if (error instanceof Error && error.name === "AbortError") return true;

  // ZodError — validación de input, flujo esperado
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as any).name === "ZodError"
  ) return true;

  // AppError con statusCode 4xx — flujo normal de negocio
  if (AppError.isAppError(error) && error.statusCode < 500) return true;

  // MonitoredError LOW o MEDIUM — no requieren alerta
  if (
    error instanceof MonitoredError &&
    (error.severity === ErrorSeverity.LOW || error.severity === ErrorSeverity.MEDIUM)
  ) return true;

  return false;
}

/**
 * Captura un error en Sentry con contexto adicional.
 * No lanza — está diseñado para usarse dentro de catch / logError sin romper el flujo.
 */
export function captureToSentry(
  error: unknown,
  context?: ErrorContext
): void {
  // No capturar en development (evita ruido local y doble-inicialización de HMR)
  if (process.env.NODE_ENV === "development") return;

  // Aplicar reglas de filtrado
  if (shouldIgnore(error)) return;

  Sentry.withScope((scope) => {
    // Adjuntar contexto de operación como extra
    if (context) {
      scope.setExtra("operation", context.operation);
      scope.setExtra("resource", context.resource);
      if (context.metadata) scope.setExtra("metadata", context.metadata);
      if (context.userId) scope.setUser({ id: context.userId });
    }

    // Determinar nivel según severidad o statusCode
    if (error instanceof MonitoredError) {
      scope.setLevel(SEVERITY_TO_SENTRY[error.severity]);
      scope.setTag("errorSeverity", error.severity);
    } else if (AppError.isAppError(error)) {
      // statusCode >= 500 por lógica de filtrado anterior
      scope.setLevel("error");
    } else {
      scope.setLevel("error");
    }

    // Adjuntar código de error como tag para agrupar en Sentry
    if (AppError.isAppError(error)) {
      scope.setTag("errorCode", error.code);
    }

    Sentry.captureException(error);
  });
}
