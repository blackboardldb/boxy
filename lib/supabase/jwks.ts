import { createRemoteJWKSet } from "jose";

/**
 * Singleton de JWKS de Supabase.
 *
 * createRemoteJWKSet cachea las claves públicas en memoria y solo hace
 * una llamada de red cuando el set de claves ha rotado o en el primer uso.
 * En requests subsiguientes, la verificación es completamente local.
 *
 * Compatible con ECC (P-256) y Legacy HS256 — Supabase expone ambas en el JWKS.
 */
export const supabaseJWKS = createRemoteJWKSet(
  new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);
