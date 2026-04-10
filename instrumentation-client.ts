// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [Sentry.replayIntegration()],

  // 10% de traces en producción — el default 1.0 es caro.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enviar logs de la app a Sentry
  enableLogs: true,

  // Replay: 0% de sesiones normales en producción (privacidad).
  // 100% cuando hay un error — queremos reproducir el crash.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,

  // No enviar en desarrollo
  enabled: process.env.NODE_ENV === "production",

  // Filtrar errores antes de enviar
  beforeSend(event, hint) {
    const error = hint?.originalException;

    // Ignorar AbortError (navegación del usuario, fetch cancelado)
    if (error instanceof Error && error.name === "AbortError") return null;

    // Solo capturar niveles de error o fatal
    const level = event.level;
    if (level === "info" || level === "log" || level === "debug" || level === "warning") return null;

    return event;
  },

  // No enviar PII del usuario
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
