# BS Plataforma — Documento Maestro de Deuda Técnica y Roadmap

> **Nota:** Este documento consolida y reemplaza los análisis anteriores (`hal01_fase4_analisis_completo`, `roadmap_completo_bs_plataforma`, `vision_general_actualizada`). Los documentos previos quedan obsoletos y pasan a ser de referencia histórica.
> **Fuentes:** Auditoría original 2026-04-06 + tracking de commits + scan de código 2026-04-15 + correcciones de riesgo para Fase 4.

---

## Estado de todos los HALs

| HAL | Título | Estado | Commit/Ref |
|---|---|---|---|
| HAL-01 | JSONB `membership` → `UserMembership` | ✅ Completo | DROP: `862eace` |
| HAL-02 | Índices GIN/btree sobre JSONB | ✅ Completo | Supabase SQL directo |
| HAL-03 | Arrays denormalizados `ClassSession` | ✅ Completo | DROP: `2026-04-26` |
| HAL-04 | `organizationId` como columna relacional | ✅ Completo | `7af0177` |
| HAL-05 | Singleton de servicios en routes | ✅ Completo (16 routes, 6 singletons) | — |
| HAL-06 | `as any` + validación Zod | ✅ Completo (HAL-06b) | `7416315` |
| | | _Regresiones de schemas resueltas. Tipos mapeados 1:1 con frontend. Rutas críticas operativas (register, approval, expenses, plans)._ | |
| HAL-07 | `POST /api/classes` sin auth | ✅ Completo | `cb9413a` |
| HAL-08 | Filtrado de tenant en memoria Node.js | ✅ Completo | `b06c550` |
| HAL-09 | `getUserStats` SELECT * | ✅ Completo (5 COUNT paralelos + 09b conteo real) | `b1cc016` |
| HAL-10 | Zustand sin React Query | 🟡 En progreso | Sprint A ✅ `2026-04-26` |
| HAL-11 | Sin RLS en tablas public | ✅ Completo (ya estaba activo) | Confirmado |
| HAL-12 | Contraseñas hardcodeadas | ✅ Completo — env vars sin fallback (HAL-12b) | `df3d03a` |
| HAL-13 | Logger sin persistencia | ✅ Cerrado (tracesSampleRate 0.1 y errors 1.0 es correct best practice) | — |
| HAL-14 | Constraint names expuestos | 🟠 Pendiente post HAL-16 | `567283a` |
| **HAL-15** | **84 errores TSC** | **✅ Completo — 63 → 0 errores** | **`df3d03a`** |
| **HAL-16** | **141 `as any` castings** | **✅ Completo — 141 → 0** | `886f139` |

---

## Decisiones ya tomadas sobre HAL-01

| Decisión | Detalle |
|---|---|
| `history[]` embebido en JSONB | **No migrar.** Historial oficial está en `MembershipRenewal`. Descartarlo evita duplicados. |
| `centerStats` (classesAttended, remainingClasses) | **No migrar.** Están `@deprecated`. Se calculan en tiempo real desde `ClassRegistration` (HAL-09b). |
| `pendingRenewal` | **Migrar** con upsert a tabla `MembershipRenewal` existente. |
| `@unique` en `userId` de `UserMembership` | Correcto hoy. Documentar que se remueve si decidimos permitir multi-membership por usuario a futuro. |
| Fases 1-3 | No-destructivas. Rollback posible hasta Fase 4. |
| `app/auth/page.tsx` | Dummy de pruebas. No afecta nada. Se excluye del plan final. |

---

## HAL-01 — Análisis Completo pre-Fase 4

El problema raíz es que **`membership` no es solo una columna** — es una interfaz completa (`FitCenterMembership`) que el código lee en 35 archivos distintos (253 referencias detectadas en el scan). 
El mapper de Fase 3 construye un objeto que replica esa forma, por lo que **la Categoría A (185 lecturas indirectas de propiedades) NO rompe en producción**. Sin embargo, las siguientes categorías sí rompen la app de forma dramática y se deben abordar en sprints ordenados:

### Categorías Bloqueantes
- **Categoría B (🔴 Rompe) — 14 QUERIES JSONB path en Prisma:** Archivo `user-service.ts` usa sintaxis `{ membership: { path: ["..."], gte: ... } }`. Sin la columna, Prisma crashea inmediatamente.
- **Categoría C (🔴 Rompe) — 2 RAW SQL:** `app/api/admin/members/expiring` y `expired` usan `$queryRaw` directo a la sintaxis raw de base de datos column json de postgres `membership->>`.
- **Categoría D (🔴 Rompe) — 6 WRITES directos:** Rutas que hacen mutate directo a `user.membership` sin pasar por el repositorio, de forma destacada la promoción programada a activa (`scheduled→active`) en `/api/me`.

### Categoría E — Propiedades Degradadas (Ya identificadas)
- **`pendingRenewal`:** Faltante. Se debe migrar o alterar para leer directamente desde la tabla `MembershipRenewal`.
- **`centerStats.memberSince`:** Faltante en nuevo modelo. Usará temporalmente `UserMembership.createdAt`.
- **`history`:** Descartado en decisiones previas. Se limpiará la UI.

---

## HAL-01 Fase 4 — Plan de Ejecución Definitivo

*Paso previo fundamental: La Fase 2 fue limpia. Confirmaste 79 migraciones con cero huérfanos. El dual-write constante de Fase 3 te entrega actualmente seguridad total para ejecutar estos Sprints.*

### PRE-TRABAJO (Antes de modificar código)
1. **Exportar CSVs como backup propio:** Desde el Supabase Table Editor, exportar y guardar `users` (es tu backup primario e irreversible del JSONB original), `user_memberships`, `membership_renewals` y `class_registrations`.
2. **Anotar conteos de control:** Se requiere ir en vivo a tu Panel de Admin (Dashboard) y anotar cuántos usuarios existen como: Activos, Pendientes, Expirados y Programados. Estos son para comparar en el Sprint 2.

### SPRINT 1 — Eliminar WRITES al JSONB (~1.5h)
*Objetivo: NINGÚN flujo secundario ni route handler de la aplicación intenta modificar la columna `membership` en forma de patch update directo.*

| Paso / Tarea | Riesgo | Mitigación si falla |
|---|---|---|
| **1.1** `/api/classes/cancel` (Eliminar bloque remainingClasses+1, ya redundante) | 🟢 Bajo | |
| **1.2** `/api/classes/admin/cancel-bulk` (Eliminar remainingClasses+1, ya redundante) | 🟢 Bajo | |
| **1.3** `renewal/approve/route.ts` (Reemplazar patch raw con `userService.approveUser()`) | 🟡 Medio | Revertir archivo, el json está protegido. |
| **1.4** `renewal/reject/route.ts` (Reemplazar patch raw con update en tabla `MembershipRenewal`) | 🟡 Medio | Revertir archivo |
| **1.5** `/api/me/route.ts` (Reescribir promoción scheduled a activa vía `UserMembership`) | 🔴 Alto | Revertir y parchear. (Login a alumnos bloqueado de fallar) |

⏸ **Validar iterativamente en Producción antes de seguir:**
1. Alumnado puede iniciar sesión de manera sana (`/api/me`).
2. Funciones de "Aprobar" y "Rechazar" renovaciones operan sin 500s.

### SPRINT 2 — Migrar QUERIES JSONB (~1h)
*Objetivo: NINGÚN `where` ejecuta sentencias base de datos de json query exclusivas de prisma JSONB (`path: [...]`).*

| Paso / Tarea | Riesgo | Mitigación si falla |
|---|---|---|
| **2.1** `expiring/route.ts` (Cambiar SQLRaw a Prisma query normal sobre tabla relacional UserMembership) | 🟡 Medio | |
| **2.2** `expired/route.ts` (Cambiar SQLRaw a Prisma query normal sobre tabla relacional UserMembership) | 🟡 Medio | |
| **2.3** `user-service.ts` (Reescribir 5 helpers listados en L200-263 transformando json target por `userMembership: {}`) | 🟡 Medio | |
| **2.4** `user-service.ts`: `getUsers()` L47-140 (Filtros de estatus a query object relacional -> `userMembership: {}`) | 🔴 Alto | Revertir archivo. El inner join que causará 0s en el panel de admin si hay usuarios sin row fallará aquí en todo el portal. |

⏸ **Validar iterativamente en Producción antes de seguir:**
1. Filtrados del panel admin (Estatus Activos/Inactivos) reportan la **misma cantidad exacta verificable** frente a los reportes previos del Pre-Trabajo.
2. Rutas api expiring/expired funcionan sin cuelgues `status 500`.

### SPRINT 3 — Propiedades Faltantes / Refactors Menores (~45min)
*Objetivo: Las propiedades faltantes en objeto devuelto que no existen en base de datos tienen su propia fuente en memoria.*

| Paso / Tarea |
|---|
| **3.1** `user-profile.tsx`: Adaptar fecha "Miembro Desde" iterando a la fecha normal de createdAt. |
| **3.2** `getPlanStatus`: Eliminar check hardcodeado de prop obsoleta de pendingRenewal. |
| **3.3** `useNotificationCount`: Apuntar conteo exclusivamente al db hook de `MembershipRenewal`. |
| **3.4** `blacksheep-store.ts`: Limpiar spread destructivo en estado cliente de requestPlanRenewal. |

⏸ **Validar en Producción:**
1. Correr 48 horas sin detectar un solo error Sentry en estas rutas relacionadas u componentes (se sugiere monitor).

### SPRINT 4 — Limpieza Final pre-DROP y The Big Drop (~0.5h)
*Objetivo: Extinguir las referencias en código a la interfaz/JSONB y realizar la cirugía destructiva a nivel Base de Datos.*

| Paso / Tarea | Estado Realizado |
|---|---|
| Eliminar `membership.planConfig` (usa `userMembership.classLimit`) en `class-service` | ✅ Hecho |
| Remover chequeo `pendingRenewal` en `utils.ts` | ✅ Hecho |
| Eliminar dual-write JSONB en `user-repository.ts` | ✅ Hecho |
| Eliminar *fallback loader* en `user-repository.ts` (`mapToEntity`) | ✅ Hecho |
| **Respaldo de Seguridad:** Crear tabla `_backup_membership_jsonb` en Supabase (80 rows) | ✅ Hecho |
| Completar 24-48 horas de observación sin errores o crasheos | ✅ Hecho |
| **PUNTO DE NO RETORNO:** `ALTER TABLE users DROP COLUMN membership;` directa en BD | ✅ Hecho |
| Eliminar columna `membership Json?` de schema.prisma + `prisma generate` | ✅ Hecho |
| Corregir referencias residuales post-DROP (`participants/route.ts`, `me/history/route.ts`) | ✅ Hecho |

**Script de respaldo ejecutado en SQL Editor (pre-DROP):**
```sql
CREATE TABLE public._backup_membership_jsonb AS
SELECT id, membership, "updatedAt"
FROM public.users
WHERE membership IS NOT NULL;
```

---

### Estado de Eliminación Efectivo de Referencias (Check de Seguridad)
> Grep ejecutado post-Sprint 4 pre-DROP. Referencias residuales son lecturas pasivas del objeto mapeado en memoria (Categoría A) — no bloquean el DROP. Dual-write eliminado en `user-repository.ts`. Cero writes directos al JSONB en routes confirmado.

> NOTA de Emergencia Post-Migrante: Si el Sprint 4 falla dramáticamente al intentar bootear la app o una vista suelta explota luego de 1 semana en producción, **el único remedio aceptable es hacer un `Hot-Fix`** en el route o server-component afecto que omitiste parchar durante Sprint 1-3. Los datos de la membresía **están vivos y salvos** en la nueva tabla externa `user_memberships`. 

---

## Roadmap Estratégico General de Deuda Técnica (Post HAL-01)

| HAL | Título / Problema | Riesgo | Hrs | Estatus del Task |
|---|---|---|---|---|
| **HAL-15** | **84 Errores de tipado Typescript Build**. Especialmente 39 errores de promesas en dynamic params de Next.js 15 y 8 problemas de destructuring de prop `user.membership` possibly null (Estos resuelven iterativamente post-fase 4). | 🟢 Bajo | 2h | ✅ Completo |
| **HAL-12b** | **Contraseñas Locales (`blacksheep26`)**. Retirar y prohibir el fallback harcodeado de contraseñas de alumno de fallar su variable de ambiente correspondiente, emitiendo throw catch error general. | 🟢 Bajo | .25h | ✅ Completo |
| **HAL-06b** | **Zod en 26 rutas API PENDIENTES**. Implementado. Bugs críticos de alineación frontend-backend (datetime vs min, nombres reales de schemas, validaciones inline) totalmente resueltos. | 🟢 Refactor | Listo | ✅ Completado |
| **HAL-03** | **Arrays denormalizados `ClassSession`** (`registeredParticipantsIds`, `waitlistParticipantsIds`). Removidos. Fuente de verdad → `ClassRegistration`. Mapper dual-read → writes eliminados → DROP de columnas ejecutado 2026-04-26. TSC 0 errores. Generación de clases operativa. | ✅ Completo | DROP: `2026-04-26` |
| **HAL-16** | **141 → 0 `as any` restantes**. Type Safety Audit completo. Front, backend, validadores, store y utilidades estrictamente tipados. TSC = 0 errores. | 🟢 Bajo | 6h | **✅ Completo — 2026-04-26** |
| **HAL-14** | **Constraint names expuestos**. `handleZodError`/`handlePrismaError`: `error: any` → `error: unknown`. Type guards narrowed. P2002/P2025/P2003 ya protegíos con `isDev`. Commit `79c96d0`. | 🟢 Bajo | 0.5h | **✅ Completo — 2026-04-26** |
| **HAL-10** | **Zustand → React Query (TanStack)**. Traspaso final a manejo async de frontend global. Es una tarea backlogged sin deadline pero recomendada iterar posteriormente con el sistema puramente relacional optimizado y la query JSONB bloqueante fuera. | 🟢 Bajo | 12h | **Bloqueado por HAL-01 y HAL-03** |

### Flujo de Ejecución Acumulativo de HALs (Cronograma)

```mermaid
graph TD
    HAL01[HAL-01 Fase 4<br>Eliminar JSONB] --> HAL03[HAL-03<br>Arrays denormalizados]
    HAL15[HAL-15<br>Fix TSC errors] --> HAL16[HAL-16<br>Reducir tipado escapado]
    HAL03 --> HAL10[HAL-10<br>React Query Integración]
    HAL01 --> HAL10
    
    subgraph COMPLETADOS (Recientes)
        HAL01
        HAL15
        HAL12[HAL-12b<br>Remover fallbacks pass]
        HAL06[HAL-06b<br>Zod Escenarios Críticos]
    end
    subgraph AHORA (En Progreso)
        HAL03
    end
    subgraph FUTURO (12 horas est.)
        HAL10
    end
```

**Total de Horas Asignadas / Restantes Globalmente:** ~28-30 horas.

---

## Orden de Ejecución Restante (Post HAL-01)

Basándome en el documento maestro, aquí están las tareas en orden de ejecución:

---

## HAL-15 — Fix 84 errores TypeScript
**Estado: ✅ Completo**
- Fix de `TS2554` (promesas en Next 15 para `params` dinámicos en route handlers y pages).
- Inconvenientes residuales de properties `TS2339` resueltos gracias al DROP efectivo de membresías JSONB de HAL-01.
- Fix de tipado estricto `TS2353` del logger/Sentry context.
- Proyecto compila a 0 errores en `tsc --noEmit`.

---

## HAL-12b — Eliminar fallback de contraseñas
**Estado: ✅ Completo**
- Eliminado fallback inseguro de constraseñas (`blacksheep26`) en el código de `/lib/supabase/admin.ts`.
- Implementada aserción fuerte (throw error) en caso de faltar las variables de entorno para contraseñas *default*.

---

## HAL-06b — Validación Zod en rutas API
**Estado: ✅ Completo**
- Implementadas y conectadas reglas de Zod en +20 rutas API vulnerables (flujos de usuarios, clases, suscripciones y configuración).
- Bugfixes post-migración aplicados exitosamente: relajación de strings ISO por `.min(1)` para recibir datos en formato `YYYY-MM-DD` del actual frontend, y refactorizado de `createPlanSchema` reestructurándolo para alinearse con los payloads exactos enviados por React (dejando de lado los obsoletos modelos rígidos de Prisma).

---

## HAL-03 — Arrays denormalizados en `ClassSession`

> **Nota de Seguridad y Contexto:**
> Existía una diferencia en el documento que dejaba datos desactualizados y provocó el fallo en HAL-06b. Fue una sola cosa: se aplicaron schemas construidos contra tipos de Prisma sin verificar los payloads reales del frontend. El resultado fue Zod bloqueando operaciones válidas en producción.
> HAL-03 tiene el mismo riesgo pero amplificado — no son schemas de validación, son queries y mappers que toda la app consume. Si el mapper de ClassSession deja de devolver registeredParticipantsIds antes de que todos los consumidores estén actualizados, la app rompe en múltiples puntos simultáneamente. Mantendremos dos archivos para cruzar la verdad: el maestro (`vision_general_actualizada.md`) y éste con detalle táctico.

### Estado
**✅ COMPLETO — DROP ejecutado 2026-04-26. TSC 0 errores. Generación de clases operativa para mayo.**

### Hallazgos de Auditoría (Sesión 1 — 2026-04-19)

**Volumen de datos:**
- 336 clases totales en `class_sessions`
- 92 clases con datos en `registeredParticipantsIds`
- 0 clases con datos en `waitlistParticipantsIds`
- 269 registros en `ClassRegistration`

**Desincronizaciones encontradas:**
- 1 sola clase desincronizada: `cls_2026-04-17_1900_disc_crossfit_001`
- Array tiene 2 IDs, `ClassRegistration` tiene 3 registros
- Clase ya pasada (17 abril) — sin impacto operativo
- `ClassRegistration` es más completa que el array — confirma que es la fuente de verdad

**Clases futuras desincronizadas: 0** — semáforo verde para migración.

**Schema real de `ClassRegistration`:**
```
id, userId, classId, status, registeredAt, cancelledAt, notes
```
> ⚠️ El FK es `classId`, no `classSessionId`. Cualquier query que use `classSessionId` va a fallar.

**Referencias en código (archivos que leen o escriben los arrays):**
- `lib/repositories/class-repository.ts` — mapper + proyecciones
- `lib/services/class-service.ts` — lógica de negocio, `.includes()`, `.filter()`
- `lib/validation-service.ts` — validaciones de cupo (`.length >= capacity`)
- `app/page.tsx` — calcula `registeredCount` desde array
- `app/admin/clases/page.tsx` — lee `.length`
- `app/calendar/page.tsx` — filtra `isRegistered` desde array
- `app/api/classes/route.ts` — inyecta arrays vacíos al crear
- `app/api/classes/cancel/route.ts` — lee inscritos para notificar
- `app/api/classes/generate/route.ts` — hardcodea arrays vacíos
- `app/api/classes/persist-generated/route.ts` — hardcodea arrays vacíos

---

### Proceso de ejecución

```
Sesión 1: Auditoría                              ✅ COMPLETA
Sesión 2: Backup + verificación de datos         ✅ COMPLETA
Sesión 3: Sprint A — Mapper dual-read            ✅ COMPLETA
Sesión 4: Sprint B — Eliminar writes             ✅ COMPLETA
          Observación 24-48h sin incidentes      ✅ SUPERADA
Sesión 5: Sprint C — DROP de columnas            ✅ COMPLETA (2026-04-26)
          Verificación SQL Supabase: 0 filas     ✅ CONFIRMADA
          TSC --noEmit: 0 errores                ✅ CONFIRMADO
          Generación clases mayo: operativa      ✅ CONFIRMADA
```

---

### Sesión 2 — Backup y verificación (próximo paso)

**Paso 1 — Backup en Supabase SQL Editor:**
```sql
CREATE TABLE public._backup_classsession_arrays AS
SELECT id, "registeredParticipantsIds", "waitlistParticipantsIds", "updatedAt"
FROM public.class_sessions
WHERE array_length("registeredParticipantsIds", 1) > 0
   OR array_length("waitlistParticipantsIds", 1) > 0;

-- Verificar
SELECT COUNT(*) FROM public._backup_classsession_arrays;
-- Esperado: ~92
```

**Paso 2 — Habilitar RLS en la tabla de backup:**
Supabase va a mostrar la alerta de RLS — elegir **"Run and enable RLS"**.

**Paso 3 — Anotar conteos de control antes de tocar código:**
En el panel admin anotar:
- Total clases activas hoy
- Total inscritos en clases de esta semana
- Total en lista de espera (debería ser 0)

Estos números son el comparador post-migración.

---

### Sesión 3 — Sprint A: Mapper dual-read

**Objetivo:** `mapToEntity()` en `class-repository.ts` calcula los arrays desde `ClassRegistration` en vez de leer las columnas. Las columnas siguen existiendo pero dejan de ser la fuente.

```typescript
// ❌ ANTES — lee columna directamente
registeredParticipantsIds: prismaSession.registeredParticipantsIds,
waitlistParticipantsIds: prismaSession.waitlistParticipantsIds,

// ✅ DESPUÉS — calcula desde relación
registeredParticipantsIds: prismaSession.registrations
  ?.filter(r => r.status === 'registered')
  .map(r => r.userId) ?? [],
waitlistParticipantsIds: prismaSession.registrations
  ?.filter(r => r.status === 'waitlist')
  .map(r => r.userId) ?? [],
```

Incluir `registrations` en todos los `findMany` / `findUnique`:
```typescript
include: {
  registrations: {
    select: { userId: true, status: true }
  }
}
```

⏸ Validar: inscripción y cancelación funcionan, conteos coinciden con los anotados en Sesión 2.

---

### Sesión 4 — Sprint B: Eliminar writes + observación

**Objetivo:** Ningún route ni service escribe en los arrays. Solo `ClassRegistration` recibe writes.

Buscar todos los writes activos:
```bash
grep -rn "registeredParticipantsIds\|waitlistParticipantsIds" \
  app/ lib/ --include="*.ts" \
  | grep -v "select\|include\|//" \
  | grep -v "node_modules"
```

En `class-service.ts` — eliminar los bloques que hacen push/filter sobre los arrays en `registerStudent` y `cancelRegistration`.

En `api/classes/generate`, `persist-generated`, `route.ts` — eliminar hardcodeo de arrays vacíos al crear clases.

⏸ **Observación 24-48h en producción sin errores antes de continuar al Sprint C.**

---

### Sesión 5 — Sprint C: DROP de columnas (punto de no retorno)

**Check de seguridad final:**
```bash
grep -rn "registeredParticipantsIds\|waitlistParticipantsIds" \
  app/ lib/ components/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "select\|include\|//\|node_modules" \
  | wc -l
# Esperado: 0
```

**Schema:**
```prisma
// Eliminar de ClassSession en schema.prisma:
registeredParticipantsIds  String[]
waitlistParticipantsIds    String[]
```

```bash
npx prisma migrate deploy
```

**Verificación en Supabase:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'class_sessions'
  AND column_name IN ('registeredParticipantsIds', 'waitlistParticipantsIds');
-- Esperado: sin filas
```

---

### Regla
> No se ejecuta Sprint C sin haber completado las 24-48h de observación del Sprint B sin incidentes.

---

## Orden de confirmación entre tareas

```
✅ HAL-01 DROP
✅ HAL-15 + HAL-12b
✅ HAL-06b
✅ HAL-03 — Sprint C completo (DROP 2026-04-26)
    ↓
✅ HAL-16 — Type Safety Audit Completo (2026-04-26)
   141 → 0 as any casts. Validación estricta y TSC 0.
    ↓
✅ HAL-14 — Completo (2026-04-26, commit 79c96d0)
   handler.ts: 0 as any, constraint names seguros en prod
    ↓
HAL-10 (TanStack/React Query) ← PRÓXIMO PASO
```
