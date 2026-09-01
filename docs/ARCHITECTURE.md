# Boxy — Arquitectura del Sistema

> Estado actual del sistema. No es un historial de cambios (ver CHANGELOG.md) ni una lista de pendientes (ver BACKLOG.md). Si algo descrito acá deja de ser cierto, este documento se actualiza — no se agregan parches al final.

## 1. Identidad

Boxy es un SaaS B2B multi-tenant (ERP/CRM para gimnasios y centros deportivos). Cada centro es un tenant lógicamente aislado (`Organization`). Un mismo email puede existir en múltiples centros; los datos operativos nunca se comparten entre ellos.

| Aspecto | Valor |
|---|---|
| Tenancy | Aislamiento lógico por `organizationId` en capa aplicativa (no RLS) |
| Pagos | Manuales/externos. Sin pasarela integrada — decisión de negocio deliberada |
| Auth | Supabase Auth, JWT + cookies SSR |

## 2. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js App Router |
| ORM | Prisma con `multiSchema` + `@prisma/adapter-pg` |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Estado cliente | TanStack Query (server state) + Zustand (UI state) — nunca mezclar |
| Validación | Zod en boundaries |
| Cifrado | AES-256-GCM (Node `crypto`), inicialización lazy |

## 3. Resolución de tenant (flujo real)

```
Usuario → Supabase Auth → JWT cookie
  → proxy.ts (lee hostname/subdominio, resuelve organizationId, inyecta header x-organization-id)
  → requireAuthFast(request)
    → Valida JWT localmente
    → Lee x-organization-id del HEADER, nunca del JWT
    → findUnique en organization_members por PK compuesta (userId, organizationId)
    → Devuelve { user, organizationId, role, dbUserId }
```

**Regla fundamental:** el `organizationId` de una request siempre sale del header `x-organization-id` inyectado por el proxy — nunca del JWT (puede estar desfasado) ni del body del request (el cliente no decide su propio tenant).

## 4. Guards vigentes

Ubicación: `lib/supabase/auth-guard.ts`

- `requireAuthFast(request)` — sesión válida + pertenencia al tenant del header. Para lecturas de datos propios/org.
- `requireAdminFast(request)` — igual que arriba + rol `ADMIN` o `COACH`. Para mutaciones.
- `requireSelfOrAdminFast(request, targetUserId)` — un `ALUMNO` solo puede actuar sobre sí mismo; `ADMIN`/`COACH` sobre cualquiera del tenant.
- `requireManager()` — namespace separado (`/manager/api/`), valida contra `manager_users`, devuelve `role: "OWNER" | "SUPPORT"`.

**No existen `requireAuth()` ni `requireAdmin()` a secas** — fueron reemplazadas. Si aparecen en código nuevo, es una regresión.

## 5. Modelo de datos — entidades core

```
Organization
  orgType, status (TRIAL|ACTIVE|SUSPENDED|CANCELED), billingCycle (A|B), billingPeriodEnd
  country, region, city → ubicación geográfica del centro
  saasPlanId, saasPlanLimit, saasPlanPrice → snapshot inmutable (ver sección 7)
  defaultAdminPassword / defaultStudentPassword / defaultCoachPassword → cifrados AES-256-GCM
  customIconUrl → branding (ver sección 8)

User
  authId → puente 1:1 con auth.users (Supabase)

OrganizationMember   → pertenencia real al tenant (role: ALUMNO|COACH|ADMIN)
UserMembership       → plan y estado de membresía en ese centro (pending|scheduled|active|expired)
MembershipRenewal    → ledger inmutable de pagos
MembershipPlan       → catálogo de planes tarifarios del centro

ClassSession         → capacity: Int (no hay enrolledCount, se computa vía COUNT)
ClassRegistration    → status: registered|cancelled, @@unique([userId, classId])

RoutineTemplate           → biblioteca, content: Json
RoutineAssignment         → instancia por fecha, content: Json (snapshot inmutable)
RoutineAssignmentMember   → alumno + completedAt + notas

Plan (tabla SaaS, panel superadmin) → snapshot inmutable asignado a Organization
```

## 6. Multi-tenancy — modelo de identidad

Un mismo email puede pertenecer a múltiples centros con roles distintos.

- **`OrganizationMember`** — determina pertenencia (guard de acceso). El guard de pertenencia siempre usa `memberships.some(m => m.organizationId === auth.organizationId)`, nunca "tiene un plan activo".
- **`UserMembership`** — plan/estado en ese centro específico.
- **`MembershipRenewal`** — historial de pagos en ese centro específico.

**Cambio de tenant activo — mecanismo real:** no existe selector client-side
que cambie `organizationId` dentro de la misma sesión de React (confirmado:
sin `switchOrg`/`setActiveOrg` en todo el codebase). El tenant se resuelve
únicamente por subdominio (§3) — cambiar de centro implica navegar a otro
subdominio, lo que fuerza un hard reload del navegador. **Consecuencia:** el
`queryClient` de TanStack Query nunca sobrevive un cambio de tenant, y nunca
se comparte entre tenants. Cualquier invalidación de cache sin `organizationId`
(ej. `["me"]` sin scope) no es un vector de fuga cross-tenant mientras este
mecanismo siga siendo así — si en el futuro se introduce un selector de
organización sin recarga completa, esta garantía deja de ser válida y hay que
re-auditar todas las invalidaciones globales de query keys.

**Consecuencia de identidad global en Supabase Auth:** `auth.users` es una fila por email, un solo password hash. Resetear la contraseña de un alumno bicentrado afecta su acceso a *todos* sus centros, no solo al que ejecutó el reset. Esto es una propiedad de Supabase Auth, no un bug — debe comunicarse en la UI cuando aplique (ver BACKLOG.md).

## 7. Planes SaaS — snapshot inmutable

Los límites y precios de plan asignados a un centro **no se recalculan en vivo** desde la plantilla `Plan`. Al asignar un plan a un centro, se copian (`saasPlanId`, `saasPlanLimit`, `saasPlanPrice`) al momento exacto de la asignación. Editar la plantilla `Plan` después:

- **No afecta** a los centros que ya la tienen asignada.
- **Sí afecta** a cualquier centro que se le asigne (o reasigne) el plan después del cambio.

`plan.name` (vía relación) se usa exclusivamente para presentación en UI — nunca para lógica de negocio.

Unidad monetaria: CLP, almacenado ×100 (convención de consistencia técnica heredada de `OrganizationPayment.amount`, no porque CLP tenga centavos reales en circulación).

## 8. Branding

Solo `customIconUrl` está implementado (subida de PNG por el superadmin desde `/manager/centros/[id]`). `customSplashUrl` existe en el schema pero fue descartado deliberadamente — ver DECISIONES.md, tabla "Explícitamente descartado". El campo puede quedar sin uso en el schema (no bloquea nada) o eliminarse en una limpieza futura si se desea.

Validaciones de archivo: magic bytes reales de PNG, peso ≤2MB, dimensiones máximas vía parsing manual del header IHDR (sin librerías de imagen). Escalado adicional a 512px en cliente vía Canvas API. Bucket de Supabase Storage `orgs`, público, con restricciones nativas de tipo/tamaño como segunda capa.

Componente de consumo: `CenterLogo` (compartido entre `/hub` y `/alumnos`). Resuelto server-side para `/hub` (sin salto visual); resuelto client-side con estado `loading` explícito para `/alumnos`.

## 9. Manejo de fechas

Rangos de fecha para operaciones de calendario deben usar `startOfDayChile`/`endOfDayChile` (`lib/utils.ts`), no `new Date(...)` con string ISO fijo en UTC — evita desfases de zona horaria en horario chileno. **Estado real:** implementado en `class-service.ts`. No confirmado como aplicado en todos los endpoints que tocan fechas — verificar antes de asumir cobertura total.

## 10. Manejo de errores

Los endpoints deben usar `ErrorHandler.createResponse(error, { operation, resource })` (`lib/errors/handler.ts`), no devolver `error.message` crudo al cliente — evita fuga de detalles internos (nombres de constraint, campos de Prisma). En desarrollo incluye stack trace; en producción, código genérico.

## 11. Realtime — eliminado

Boxy no usa Supabase Realtime. Fue implementado, encontrado inerte (RLS activo sin policies) y eliminado del código por decisión de producto — el patrón de actualización real siempre fue "refetch al reenfocar la app", sin valor percibido adicional de Realtime. Si se reevalúa en el futuro: diseñar desde cero, con policies RLS correctas desde el inicio, sin reutilizar código histórico.

## 12. RLS (Row-Level Security)

`pg_policies` = 0 en todas las tablas de negocio. Prisma corre como rol `postgres`, que bypasea RLS. Toda la protección de aislamiento recae en la capa aplicativa (guards + `where: { organizationId }` en cada query). Única excepción: `class_sessions` tiene una policy preventiva de `SELECT` creada (sin superficie activa hoy, preparada por si se reintroduce lectura directa desde cliente).

## 13. Schema `auth` en Prisma

`schema.prisma` declara 22 modelos mapeados a `@@schema("auth")` (tablas internas de Supabase). Esto causa que el motor de migraciones de Prisma los incluya en cualquier baseline generado.

**Resuelto parcialmente (26 ago 2026):** Prisma ya no trackea el schema `auth` 
(`schemas = ["public"]`, modelos removidos). Esto evita que *futuras* migraciones 
generen DDL sobre `auth`.

**Riesgo residual, sin resolver:** la migración histórica `0_init/migration.sql` 
SÍ contiene DDL de `auth` (43 sentencias). No se editó ese archivo porque el 
proyecto no tiene entorno de staging (dev conecta directo a producción) y 
coordinar `migrate resolve` sin poder probarlo primero es más riesgo que beneficio.

**PROHIBIDO mientras esto no se resuelva:** ejecutar `prisma migrate reset` o 
`prisma migrate dev` en este proyecto, bajo ninguna circunstancia. El entorno de 
desarrollo apunta a la misma base de datos de producción — un reset destruye datos 
reales. Usar únicamente `prisma migrate deploy` (nunca resetea, solo aplica 
migraciones nuevas en orden) o el flujo manual de `db-migrations.md` para índices.

## 14. Suspensión de Centros (V1)

Cuando un centro no renueva su suscripción, su `status` pasa a `SUSPENDED`.
El bloqueo se ejecuta directamente en el middleware de Next.js (`proxy.ts`) para proteger las rutas a nivel subdominio, bajo la siguiente lógica:

1. **Visibilidad inteligente por rol**: Se extrae el rol de la sesión de Supabase (JWT).
   - **Administradores y Coaches (`ADMIN`, `COACH`)**: Tienen el pase exento (`isExemptRole`). Se les permite entrar al dashboard (`/hub`) donde ven un banner persistente global en el layout informando la suspensión.
   - **Alumnos y visitas (`ALUMNO` o anónimo)**: Cualquier request a rutas protegidas se redirige a `/suspended` (página de bloqueo total).
2. **APIs bloqueadas para alumnos**: Si la petición empieza con `/api/` (ej. llamadas de React Query) y el rol no está exento, el proxy devuelve una respuesta `JSON 503` en lugar de hacer un *rewrite* a la página HTML de `/suspended`. Esto evita errores de parseo o crasheos de cliente.
3. **Trade-off de seguridad**: El middleware extrae el rol del JWT `user.app_metadata.role`, el cual confía en la firma criptográfica localmente sin golpear la base de datos de permisos (`OrganizationMember`). Esto implica que si un admin fue degradado recientemente, podría conservar acceso exento a `/hub` por hasta 1 hora (TTL del JWT). Es un riesgo residual asumido a cambio del beneficio en latencia.
