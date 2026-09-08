# Boxy — Historial de Cambios

> Registro cronológico de fixes y features con referencia a commit. Ver ARCHITECTURE.md para el estado actual del sistema (no este documento).

## 2026-09-07

| Commit | Cambio | Verificación |
|---|---|---|
| `baebf48` | Fix crítico: `calculateBillingPeriodEnd` usa getters UTC sobre `toZonedTime` e incluye `endOfDayChile` para aislar el cálculo del TZ de la máquina. | Corridas locales y en `TZ=UTC` aisladas. Tipado verificado. |
| `50b648c` | Fix crítico: `autoApprove` activa membresías futuras como `active` de inmediato | Comprobación manual de código implementado |

## 2026-09-08

| Commit | Cambio | Verificación |
|---|---|---|
| `bd6fb43` | Fix preventivo: desfase UTC en `ClassSession.dateTime` — 3 archivos (`class-service.ts`, `classes/route.ts`, `validation-service.ts`) usaban `toISOString().split("T")[0]` que devuelve el día en UTC en vez del día en Chile. Fix: `Intl.DateTimeFormat` para extracción del día + `startOfDayChile`/`endOfDayChile` para rangos. | `tsc --noEmit` limpio. Query en BD: 0 sesiones afectadas (bug preventivo). |
| `6d9610f` | Fix UI stale data: Invalida explícitamente el caché de `finance-compare` al crear/eliminar egresos y aprobar/rechazar renovaciones. Corrige dashboard desactualizado. | Verificación manual de query keys en TanStack Query. |

## 2026-09-01

| Commit | Cambio | Verificación |
|---|---|---|
| `d3862cf` | Feat: Bloqueo de endpoints de mutación en `/hub` (proxy) para roles exentos en centros suspendidos. Permite solo lectura y descarga de CSVs. | Restricciones de operación en estado `SUSPENDED` validadas. |

## 2026-08-31

| Commit | Cambio | Verificación |
|---|---|---|
| `4e0f2da` | Fix crítico: Desfase de zona horaria en `finance-compare` y `stats` a fin de mes. Reemplaza `new Date()` con `getCurrentChileTime()` para cálculos de rango. | Cálculos determinísticos en `TZ=UTC`. |

## 2026-08-24

| Commit | Cambio | Verificación |
|---|---|---|
| `0faeedb` | Fix crítico: `reset-password` sin auth/tenant + password hardcodeada | 4 pruebas reales (cross-tenant, rol, sin auth, caso feliz) |
| `0faeedb` | Eliminación `sync-auth-users.ts` + referencias en README/package.json | Script `audit-legacy-passwords.ts`: 0 cuentas expuestas |
| `9d23e96` | Mitigación TOCTOU en `deletePlan` (transacción count+delete) | — |
| `61db3c0` | Fix tenant bypass en `completeAssignment` (rutinas) | — |
| `b7c4c74` | Fix inyección cross-tenant de plan en renewals (3 endpoints) | SQL: 0 explotación real en producción |
| `333d7b5` | Fix build Vercel: init lazy de `ENCRYPTION_KEY` | Log de build limpio, deploy Ready |
| `ed42962` | Fix cross-tenant en instructores (`userId`, `specialties`) | Script: 0 casos existentes explotados |
| `62d18ae` | Fix `defaultCoachId` sin validar tenant en disciplinas | — |
| — | Fix fail-open en `getUserScopedToOrg` | Verificación manual del `where`/`include` |
| — | Fix IDOR en `getClassById` | Tipado estricto, parámetro no-opcional |
| — | Fix `me/change-password` sin re-autenticación | Cliente Supabase aislado (`persistSession: false`), frontend sincronizado |
| — | Feature: Planes SaaS editables (tabla `Plan`, snapshot inmutable) | Prueba real: editar plantilla no modificó snapshot de centro ya asignado |
| — | Feature: Precio mensual en planes (CLP ×100) | — |
| — | Feature: Branding — upload de ícono (PNG, magic bytes, IHDR, Canvas 512px) | Prueba visual en manager/hub/alumnos |
| — | Fix: policy RLS preventiva en `class_sessions` | `pg_policies` confirmó policy creada |
| `d420e0c` | Resolución de drift de schema Prisma — baseline `0_init` | `migrate status` limpio |
| `f256225` | Creación de `BACKLOG.md` con formato estructurado | — |
| `8563919` | Fix: cron de billing bloqueado por proxy (bypass `/manager/api/cron/`) | `CRON_SECRET` confirmado como segunda barrera en el endpoint |
| — | Fix: PII de manager enmascarada por rol (`OWNER`/`SUPPORT`) | `tsc --noEmit` limpio |
| — | Purga de `saasPlanName` en TypeScript (6 archivos) | Grep final: 0 resultados |
| — | Consolidación `CenterLogo` + fix de carga lenta de logo | Prueba visual (sin salto en hub, skeleton en alumnos) |

## 2026-08-26

| Commit | Cambio | Verificación |
|---|---|---|
| — | Fix crítico: `createAuthUser` usaba contraseñas globales de env vars en lugar de contraseñas por tenant — erradicado `DEFAULT_PASSWORDS` de `admin.ts`, `explicitPassword` ahora parámetro obligatorio; 3 call-sites productivos actualizados (`api/users`, `api/instructors`, `manager-service`) + 2 scripts de seed con hardcode; vars `DEFAULT_PASSWORD_*` eliminadas de `.env` | `tsc --noEmit` limpio (0 call-sites viejos); control de flujo confirma Caso B (usuario multi-tenant) no pasa por `createAuthUser` |
| — | Fix: `@@schema("auth")` — modelos `auth.*` removidos de `schema.prisma`, `multiSchema` desactivado | `prisma validate` + `tsc --noEmit` limpios |
| — | Fix: rate-limit en `me/change-password` — 5 intentos fallidos en 15 min = 429, via `SystemEvent` por `(organizationId, userId)` | `tsc --noEmit` limpio |
| — | Fix: proxy — whitelist explícita de rutas de cron (`CRON_ROUTES = new Set(...)`) + `crypto.timingSafeEqual` en `CRON_SECRET` | `tsc --noEmit` limpio |
| — | Auditoría de seguridad post-fix contraseñas | Historial Git comprobó 0 exposición de variables productivas (ej. `CenterWelcome67@`). Query en DB comprobó 0 usuarios con `authId: ""` |

## 2026-08-27

| Commit | Cambio | Verificación |
|---|---|---|
| `0c5d31e` | `DROP COLUMN saasPlanName` de la BD | `prisma validate` y `tsc --noEmit` limpios |
| `7718ab0` | Erradicar variables globales `DEFAULT_PASSWORD_*` en creación de usuarios (incluyendo backfill) | 0 dependencias globales, uso de `Organization.defaultStudentPassword` |
| `7718ab0` | Refactor script `create-auth-for-existing-users.ts` (contraseña por tenant y fix `authId: "dummy*"`) | Queries correctas a DB; skips ruidosos operativos |
| `7718ab0` | Script de reconciliación Auth/Prisma (`reconcile-auth-prisma.ts`) | Contraste de `supabase.auth.admin.listUsers` vs `prisma.user` |
| `4410a06` | Fix: re-lanzar redirects de Next.js (`requireManager`) en endpoints API via `rethrowIfRedirect` | Aplicado de forma transversal a los 9 endpoints en `/manager/api/` |
