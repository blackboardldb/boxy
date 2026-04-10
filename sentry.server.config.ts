// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // 10% de traces en producción — el default 1.0 es caro e innecesario.
  // Suficiente para detectar problemas de performance sin costo excesivo.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enviar logs de la app a Sentry (console.error, console.warn capturados)
  enableLogs: true,

  // No enviar en desarrollo — evita ruido y doble-inicialización con HMR
  enabled: process.env.NODE_ENV === "production",

  // Filtrar errores antes de enviar a Sentry
  beforeSend(event, hint) {
    const error = hint?.originalException;

    // Ignorar AbortError (fetch cancelado por el cliente)
    if (error instanceof Error && error.name === "AbortError") return null;

    // Ignorar ZodError (validación de input — flujo esperado)
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as any).name === "ZodError"
    ) return null;

    // Solo capturar si el evento tiene nivel error o fatal
    // (warning y menores se loguean pero no necesitan alerta)
    const level = event.level;
    if (level === "info" || level === "log" || level === "debug") return null;

    return event;
  },

  // No enviar PII - los datos de usuarios son sensibles
  sendDefaultPii: false,
});
