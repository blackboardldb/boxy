# Boxy — Historial de Cambios

> Registro cronológico de fixes y features con referencia a commit. Ver ARCHITECTURE.md para el estado actual del sistema (no este documento).

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
