-- Tarea 3 (PERF-04): Índice compuesto tenant-first en membership_renewals
-- Aplicado via script directo (npx tsx scripts/apply-index.ts) porque prisma migrate dev
-- no puede crear shadow database sobre el pooler de Supabase (P3006), y db push falla
-- por permisos de owner en tablas del schema auth.
-- El índice fue verificado exitosamente en pg_indexes antes de crear este archivo.
--
-- Orden de columnas: organizationId primero porque Boxy es multi-tenant.
-- A diferencia de BS Plataforma (single-tenant), el scan siempre empieza por tenant.
CREATE INDEX IF NOT EXISTS "membership_renewals_organizationId_userId_status_requestedAt_id"
ON "public"."membership_renewals" ("organizationId", "userId", "status", "requestedAt");
