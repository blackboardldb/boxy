# BS Plataforma — Documento Maestro de Deuda Técnica y Roadmap

> **Nota:** Este documento consolida y reemplaza los análisis anteriores (`hal01_fase4_analisis_completo`, `roadmap_completo_bs_plataforma`, `vision_general_actualizada`). Los documentos previos quedan obsoletos y pasan a ser de referencia histórica.
> **Fuentes:** Auditoría original 2026-04-06 + tracking de commits + scan de código 2026-04-15 + correcciones de riesgo para Fase 4.

---

## Estado de todos los HALs

| HAL | Título | Estado | Commit/Ref |
|---|---|---|---|
| HAL-01 | JSONB `membership` → `UserMembership` | ✅ Completo | DROP: `862eace` |
| HAL-02 | Índices GIN/btree sobre JSONB | ✅ Completo | Supabase SQL directo |
| HAL-03 | Arrays denormalizados `ClassSession` | ❌ Pendiente | — |
| HAL-04 | `organizationId` como columna relacional | ✅ Completo | `7af0177` |
| HAL-05 | Singleton de servicios en routes | ✅ Completo (16 routes, 6 singletons) | — |
| HAL-06 | `as any` + validación Zod | 🟡 Parcial — 3 routes con Zod | — |
| HAL-07 | `POST /api/classes` sin auth | ✅ Completo | `cb9413a` |
| HAL-08 | Filtrado de tenant en memoria Node.js | ✅ Completo | `b06c550` |
| HAL-09 | `getUserStats` SELECT * | ✅ Completo (5 COUNT paralelos + 09b conteo real) | `b1cc016` |
| HAL-10 | Zustand sin React Query | ❌ Pendiente | — |
| HAL-11 | Sin RLS en tablas public | ✅ Completo (ya estaba activo) | Confirmado |
| HAL-12 | Contraseñas hardcodeadas | ✅ Completo — env vars sin fallback (HAL-12b) | `df3d03a` |
| HAL-13 | Logger sin persistencia | 🟡 Parcial — Sentry activo (beforeSend, 0.1 traces) | — |
| HAL-14 | Constraint names expuestos | 🟠 Parcial — `isDev` condicionado | `567283a` |
| **HAL-15** | **84 errores TSC** | **✅ Completo — 63 → 0 errores** | **`df3d03a`** |
| **HAL-16** | **141 `as any` castings** | **❌ Pendiente** | — |

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
| **HAL-15** | **84 Errores de tipado Typescript Build**. Especialmente 39 errores de promesas en dynamic params de Next.js 15 y 8 problemas de destructuring de prop `user.membership` possibly null (Estos resuelven iterativamente post-fase 4). | 🟢 Bajo | 2h | Pendiente |
| **HAL-12b** | **Contraseñas Locales (`blacksheep26`)**. Retirar y prohibir el fallback harcodeado de contraseñas de alumno de fallar su variable de ambiente correspondiente, emitiendo throw catch error general. | 🟢 Bajo | .25h | Pendiente |
| **HAL-06b** | **Zod en 26 rutas API PENDIENTES**. Incorporación de validadores. Priorizar rutas de Escritura Crítica (`/api/users/[id]`, `/api/classes`). Realizar **después** del Sprint 1 para no desorganizar fixes de renewals. | 🟡 Medio | 4h | Pendiente |
| **HAL-03** | **Arrays denormalizados `ClassSession`** (`registeredParticipantsIds`, `waitlistParticipantsIds`). Remover y armar de manera puramente relacional basandose en query a su tabla respectiva `ClassRegistration`. Riesgo de overhead en fetch general: emplear siempre sub-selección base o mitigador `_count` con id. | 🔴 Alto | 6h | **Bloqueado por HAL-01 completo** |
| **HAL-16** | **141 casteos de escape tipado (`as any`)**. No es inminente arreglar puesto que una porción notable de las rutas van a limpiar casteo iterativamente después del sprint 4 dentro de repos y mappers. | 🟢 Bajo | 6h | **Bloqueado por HAL-15** |
| **HAL-10** | **Zustand → React Query (TanStack)**. Traspaso final a manejo async de frontend global. Es una tarea backlogged sin deadline pero recomendada iterar posteriormente con el sistema puramente relacional optimizado y la query JSONB bloqueante fuera. | 🟢 Bajo | 12h | **Bloqueado por HAL-01 y HAL-03** |

### Flujo de Ejecución Acumulativo de HALs (Cronograma)

```mermaid
graph TD
    HAL01[HAL-01 Fase 4<br>Eliminar JSONB] --> HAL03[HAL-03<br>Arrays denormalizados]
    HAL15[HAL-15<br>Fix TSC errors] --> HAL16[HAL-16<br>Reducir tipado escapado]
    HAL03 --> HAL10[HAL-10<br>React Query Integración]
    HAL01 --> HAL10
    
    subgraph AHORA (4 horas reales)
        HAL01
    end
    subgraph SEMANA SIGUIENTE (6 horas relativas)
        HAL15
        HAL12[HAL-12b<br>Remover fallbacks pass]
        HAL06[HAL-06b<br>Zod Escenarios Críticos]
    end
    subgraph FUTURO (18 horas est.)
        HAL03
        HAL16
        HAL10
    end
```

**Total de Horas Asignadas / Restantes Globalmente:** ~28-30 horas.

---

## Orden de Ejecución Restante (Post HAL-01)

Basándome en el documento maestro, aquí están las tareas en orden de ejecución:

---

## HAL-15 — Fix 84 errores TypeScript
**Estimación: 2h · 1 sesión · Independiente**

> Prerrequisito: HAL-01 DROP ejecutado. Los 8 errores de `membership null` se auto-resuelven solos con el DROP.

### Pre-trabajo
Correr el compilador y capturar el estado base:
```bash
cd /tu-proyecto && npx tsc --noEmit 2>&1 | tee tsc-errors-baseline.txt
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```
Debería mostrar ≤76 errores (84 menos los 8 de `membership null` ya resueltos).

---

### Bloque 1 — 39 errores `TS2554: Expected 0 arguments` (~45min)

Causa: Next.js 15 cambió `params` a Promise asíncrona. Todos los route handlers y pages dinámicas están tipados con la sintaxis vieja.

**Patrón de fix — aplicar en cada archivo afectado:**
```typescript
// ❌ ANTES
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
```
```typescript
// ✅ DESPUÉS
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
```

**Cómo encontrar todos los archivos afectados:**
```bash
grep -rn "{ params }: { params: {" app/ --include="*.ts" --include="*.tsx"
```

Ejecutar el fix archivo por archivo. Son route handlers en `app/api/` y pages en `app/admin/` — no hay lógica compleja, es cambio mecánico de tipo + `await`.

### Bloque 2 — 8 errores `TS2339: Property X not on JsonValue` (~20min)

Causa: Accesos a propiedades del JSONB sin cast. **Estos deberían estar resueltos automáticamente por el DROP de HAL-01.** Si persisten después del DROP, significa que hay un archivo que aún referencia `membership` como `Json` — localizarlo con:

```bash
npx tsc --noEmit 2>&1 | grep "TS2339" 
```

Fix si persisten: eliminar la referencia residual o castear al tipo correcto si es otro campo JSONB.

### Bloque 3 — 8 errores `TS2353: Unknown LogContext props` (~15min)

Causa: El Logger de HAL-13 tiene props mal tipadas. Son residuales de la integración parcial de Sentry.

```bash
npx tsc --noEmit 2>&1 | grep "TS2353"
```

Fix: localizar la interfaz `LogContext` en `lib/monitoring/logger.ts` y agregar las props faltantes que el código usa, o usar `[key: string]: unknown` si son dinámicas.

### Bloque 4 — 21 errores restantes (~30min)

Provider types, spread, service worker. Atacar uno por uno según output de `tsc`:

```bash
npx tsc --noEmit 2>&1 | grep -v "TS2554\|TS2339\|TS2353"
```

### Verificación final
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```
**Resultado esperado: `0`**

---

## HAL-12b — Eliminar fallback de contraseñas
**Estimación: 15min · Inline · Independiente**

Archivo: `lib/supabase/admin.ts`

**Fix:**
```typescript
// ❌ ANTES
const DEFAULT_PASSWORDS = {
  alumno: process.env.DEFAULT_PASSWORD_ALUMNO ?? "blacksheep26",
  coach: process.env.DEFAULT_PASSWORD_COACH ?? "BsC04Ch@",
  admin: process.env.DEFAULT_PASSWORD_ADMIN ?? "BsC04Ch@",
}
```
```typescript
// ✅ DESPUÉS
const alumnoPassword = process.env.DEFAULT_PASSWORD_ALUMNO
const coachPassword = process.env.DEFAULT_PASSWORD_COACH
const adminPassword = process.env.DEFAULT_PASSWORD_ADMIN

if (!alumnoPassword || !coachPassword || !adminPassword) {
  throw new Error(
    "Missing required env vars: DEFAULT_PASSWORD_ALUMNO, DEFAULT_PASSWORD_COACH, DEFAULT_PASSWORD_ADMIN"
  )
}

const DEFAULT_PASSWORDS = {
  alumno: alumnoPassword,
  coach: coachPassword,
  admin: adminPassword,
}
```

**Antes de hacer el fix:** confirmar que las tres variables están definidas en tu `.env` de producción en Vercel/donde deployeas. Si no están, agregarlas primero o el servidor no bootea.

```bash
# Verificar localmente
grep "DEFAULT_PASSWORD" .env .env.local .env.production 2>/dev/null
```

**Verificación:** Crear un usuario de prueba desde el panel admin. Si funciona sin errores, el fix está bien. Si el servidor no bootea, falta una env var.

---

## HAL-06b — Validación Zod en 26 routes
**Estimación: 4h · 2 sesiones**

> Hacer **después** de HAL-01 DROP confirmado. Las routes de `renewal/approve` y `renewal/reject` ya fueron reescritas en Sprint 1 — revisarlas primero antes de agregar Zod para no duplicar validaciones.

### Prioridad 1 — Escritura Crítica (sesión 1, ~2h)

Estos routes aceptan body sin ninguna validación. Un input malformado puede corromper datos:

| Route | Qué validar |
|---|---|
| `PUT /api/users/[id]` | Campos editables del usuario, tipos correctos |
| `POST /api/classes` | Campos requeridos de clase, fechas válidas |
| `POST /api/plans` | Precio positivo, classLimit entero |
| `PUT /api/plans/[id]` | Idem |
| `POST /api/expenses` | Monto positivo, categoría válida |
| `PUT /api/expenses/[id]` | Idem |
| `POST /api/users/[id]/renewal/approve` | Ya reescrita — revisar si necesita Zod adicional |
| `POST /api/users/[id]/renewal/reject` | Idem |

**Patrón a seguir** (ya implementado en las 3 routes existentes — tomar como referencia):
```typescript
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  // ... campos del modelo
})

export async function PUT(request: Request, { params }) {
  const body = await request.json()
  const parsed = updateUserSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  
  // usar parsed.data en vez de body directamente
}
```

### Prioridad 2 — Escritura Operacional (sesión 2, ~1.5h)

| Route | Qué validar |
|---|---|
| `POST /api/classes/register` | userId, classId requeridos |
| `POST /api/classes/cancel` | Idem |
| `POST /api/classes/admin/cancel` | classId requerido |
| `POST /api/classes/admin/cancel-bulk` | Array de classIds no vacío |
| `POST /api/classes/persist-generated` | Shape del objeto generado |
| `PUT /api/users/[id]/notes` | Texto no vacío |

### Prioridad 3 — Configuración (~30min)

Routes de configuración del sistema — validación básica de shape:

`disciplines`, `instructors`, `organization`, `reset-password`, `emit-event`

### Verificación por route
Después de cada route, testear con un body inválido:
```bash
curl -X PUT https://tu-dominio/api/users/123 \
  -H "Content-Type: application/json" \
  -d '{"email": "no-es-un-email"}' 
# Debe retornar 400 con detalles del error
```

---

## HAL-03 — Arrays denormalizados en `ClassSession`
**Estimación: 6h · 2-3 sesiones · Bloqueado hasta HAL-01 ✅**

> No iniciar hasta confirmar HAL-01 completamente estable en producción (1 semana post-DROP sin incidentes).

### Contexto
`ClassSession` tiene `registeredParticipantsIds String[]` y `waitlistParticipantsIds String[]` que se sincronizan manualmente con `ClassRegistration`. Son 62 referencias en 23 archivos. Causa race conditions y desincronización.

### Pre-trabajo
Anotar conteos de control antes de tocar nada:
```bash
# En Supabase SQL Editor
SELECT 
  cs.id,
  array_length(cs."registeredParticipantsIds", 1) as array_count,
  COUNT(cr.id) as registration_count
FROM class_sessions cs
LEFT JOIN class_registrations cr 
  ON cr."classSessionId" = cs.id 
  AND cr.status = 'registered'
GROUP BY cs.id
HAVING array_length(cs."registeredParticipantsIds", 1) != COUNT(cr.id)::int
LIMIT 20;
```
Si retorna filas, hay desincronización actual — documentarla antes de migrar.

### Sprint A — Mapper (~1.5h)

En `class-repository.ts`, modificar `mapToEntity()` para calcular los arrays desde `ClassRegistration` en vez de leerlos de la columna:

```typescript
// ❌ ANTES — lee columna
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

Asegurarse de incluir `registrations` en todos los `findMany` / `findUnique` que devuelven `ClassSession`:
```typescript
include: {
  registrations: {
    select: { userId: true, status: true }
  }
}
```

⏸ Validar que inscripción y cancelación siguen funcionando correctamente.

### Sprint B — Eliminar writes a los arrays (~1.5h)

Buscar todos los lugares que escriben en los arrays:
```bash
grep -rn "registeredParticipantsIds\|waitlistParticipantsIds" \
  app/ lib/ --include="*.ts" | grep -v "select\|include\|//"
```

En `registerStudent` y `cancelRegistration` dentro de `class-service.ts` — eliminar los bloques que hacen push/filter sobre los arrays. La fuente de verdad es `ClassRegistration`.

⏸ Validar flujo completo: inscribir alumno → ver en lista → cancelar → verificar que sale de lista.

### Sprint C — DROP de columnas (~1h)

Una vez validado que nadie escribe ni lee las columnas directamente:

```bash
# Check previo
grep -rn "registeredParticipantsIds\|waitlistParticipantsIds" \
  app/ lib/ components/ --include="*.ts" --include="*.tsx" \
  | grep -v "select\|include\|//\|node_modules" \
  | wc -l
# Esperado: 0
```

```prisma
// Eliminar de schema.prisma en ClassSession:
registeredParticipantsIds  String[]
waitlistParticipantsIds    String[]
```

```bash
npx prisma migrate deploy
```

Verificar en Supabase:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'class_sessions'
  AND column_name IN ('registeredParticipantsIds', 'waitlistParticipantsIds');
-- Esperado: sin filas
```

---

## Orden de confirmación entre tareas

```
HAL-01 DROP confirmado
    ↓
HAL-15 + HAL-12b  ← pueden ir en paralelo, son independientes
    ↓
HAL-06b Prioridad 1
    ↓
HAL-06b Prioridad 2 + 3
    ↓
HAL-03 Sprint A → B → C   ← solo cuando HAL-01 lleve 1 semana estable
```
