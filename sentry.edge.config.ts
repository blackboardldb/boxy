// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  enableLogs: true,

  enabled: process.env.NODE_ENV === "production",

  // Filtrar AbortError en edge runtime (middleware cancelado)
  beforeSend(event, hint) {
    const error = hint?.originalException;
    if (error instanceof Error && error.name === "AbortError") return null;
    return event;
  },

  sendDefaultPii: false,
});
