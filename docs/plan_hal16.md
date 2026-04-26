# Plan de Trabajo — HAL-16: Eliminar casteos `as any`

> Estado: **HAL-16 Bloque 1 ✅ | HAL-14 ✅ — HAL-16 Bloques 2-4 siguiente**
> Documento maestro: `vision_general_actualizada.md`
> Última actualización: 2026-04-26

---

## Contexto

**131 `as any` iniciales → 89 restantes** (post Bloque 1 + HAL-14 — 2026-04-26).
Objetivo: llevar a 0 sin introducir regresiones.

**Progreso:**

| Bloque | Archivos | Inicial | Eliminados | Restantes |
|---|---|---|---|---|
| **Base** | `lib/types.ts`, `add-student-modal.tsx` | — | 0 `as any` (fix de tipo) | — |
| **Bloque 1** | todos los repos data-layer | ~65 | **39** | **92 total** |
| **Bloque 2** | services + provider-factory | ~23 | — | — |
| **Bloque 3** | components + pages | ~36 | — | — |
| **Bloque 4** | api routes + utils + monitoring | ~17 | — | — |

**Conteo actual por archivo (119 restantes — 2026-04-26):**

| Capa | Instancias | Riesgo |
|---|---|---|
| Data-layer / Services | 68 | 🟡 Medio — mappers y repos |
| Components / UI / Pages | 36 | 🟢 Bajo — lecturas de props |
| API routes | 10 | 🟢 Bajo — handlers puntuales |
| Otros (utils, store, monitoring) | 17 | 🟢 Bajo |

**Archivos con más concentración:**

| Archivo | Instancias |
|---|---|
| `components/admincomponents/user-approval.tsx` | 13 | Bloque 3 |
| `lib/services/class-service.ts` | 9 | Bloque 2 |
| `lib/data-layer/provider-factory.ts` | 9 | Bloque 2 |
| `components/user-profile.tsx` | 9 | Bloque 3 |
| `lib/services/base-service.ts` | 6 | Bloque 2 |
| `lib/validation-service.ts` | 4 | Bloque 4 |
| `lib/errors/handler.ts` | **0** | ✅ HAL-14 (2026-04-26) |
| `lib/data-layer/repositories/plan-repository.ts` | **0** | ✅ Bloque 1 |
| `app/admin/alumnos/[id]/nuevo-plan/page.tsx` | 3 | Bloque 3 |
| `lib/utils/class-generator.ts` | 2 | Bloque 4 |
| `lib/types/generator.ts` | 2 | Bloque 4 |
| `lib/data-layer/repositories/class-repository.ts` | **0** | ✅ Bloque 1 |
| `components/admincomponents/add-student-modal.tsx` | 2 | Bloque 3 |
| `app/api/users/[id]/renewal/approve/route.ts` | 2 | Bloque 4 |
| `app/api/admin/renewals/route.ts` | 2 | Bloque 4 |
| `lib/blacksheep-store.ts` | 5 | Bloque 4 |
| `lib/data-layer/repositories/user-repository.ts` | **0** | ✅ Bloque 1 |
| `lib/data-layer/repositories/organization-repository.ts` | **0** | ✅ Bloque 1 |
| `lib/data-layer/repositories/discipline-repository.ts` | **0** | ✅ Bloque 1 |
| `lib/data-layer/repositories/instructor-repository.ts` | **0** | ✅ Bloque 1 |
| `lib/data-layer/repositories/membership-renewal-repository.ts` | **0** | ✅ Bloque 1 |

---

## Patrón de fix uniforme

Cada `as any` debe reemplazarse con una de estas estrategias en orden de preferencia:

```typescript
// 1. Tipo específico — cuando se conoce la forma del objeto
const user = data as User;              // ❌ as any
const user: User = data;               // ✅

// 2. Tipo genérico narrowed — cuando es parcial
const update = data as Partial<User>;  // ✅

// 3. Type guard — cuando el tipo depende del runtime
function isUser(x: unknown): x is User {
  return x !== null && typeof x === 'object' && 'id' in x;
}

// 4. unknown + assertion — cuando realmente no se puede inferir
const raw = response as unknown as PrismaUser;  // ✅ mejor que as any

// 5. Inline type — para callbacks de Prisma o funciones externas
.map((item: { id: string; name: string }) => item.id)  // ✅
```

---

## Bloque 1 — Data-layer: repositorios (36 instancias)

**Archivos:**
- `lib/data-layer/repositories/user-repository.ts` — 13
- `lib/data-layer/repositories/organization-repository.ts` — 6
- `lib/data-layer/repositories/discipline-repository.ts` — 6
- `lib/data-layer/repositories/membership-renewal-repository.ts` — 5
- `lib/data-layer/repositories/instructor-repository.ts` — 5
- `lib/data-layer/repositories/class-repository.ts` — 2 (ya parcialmente tipado por HAL-03)
- `lib/data-layer/repositories/plan-repository.ts` — 3

**Estrategia:** Los `as any` en repositorios son casi siempre en:
1. `mapToEntity()` — el objeto Prisma raw al tipo del dominio
2. `where` clauses dinámicas — usar `Prisma.XxxWhereInput`
3. Callbacks de `.filter()` / `.map()` sin tipo anotado

```typescript
// Patrón para where dinámico
import { Prisma } from '@prisma/client';
const where: Prisma.UserWhereInput = {};
if (params.status) where.userMembership = { status: params.status };

// Patrón para mapper
function mapToEntity(raw: Prisma.UserGetPayload<{ include: { userMembership: true } }>): User {
  return { id: raw.id, ... };
}
```

> **TSC check tras Bloque 1:** `tsc --noEmit 2>&1 | grep "error TS" | wc -l` → debe ser 0

---

## Bloque 2 — Services y provider (23 instancias)

**Archivos:**
- `lib/services/class-service.ts` — 9
- `lib/data-layer/provider-factory.ts` — 9
- `lib/services/base-service.ts` — 6
- `lib/services/user-service.ts` — 1
- `lib/services/discipline-service.ts` — 0 (ya limpio por HAL-03)

**Estrategia:** 
- `provider-factory.ts` — casi seguro tiene `as any` en el factory pattern. Fix: tipar el retorno del factory con un union type o generics.
- `base-service.ts` — revisar si los `as any` son en el `T` genérico. Fix: constraintear `T extends { id: string }`.
- `class-service.ts` — probablemente en acceso a props del resultado Prisma con `include`. Fix: usar `Prisma.ClassSessionGetPayload`.

> **TSC check tras Bloque 2:** debe ser 0

---

## Bloque 3 — Components y Pages (36 instancias)

**Archivos:**
- `components/admincomponents/user-approval.tsx` — 13
- `components/user-profile.tsx` — 9
- `components/admincomponents/add-student-modal.tsx` — 2
- `components/admincomponents/plans-manager.tsx` — 1
- `components/ui/toaster.tsx` — 1
- `app/admin/alumnos/[id]/nuevo-plan/page.tsx` — 3
- `app/admin/alumnos/[id]/page.tsx` — 2
- `app/admin/configuraciones/page.tsx` — 2

**Estrategia:** En componentes los `as any` son típicamente:
1. Props sin tipar en handlers de eventos: `(e: any) =>` → `(e: React.ChangeEvent<HTMLInputElement>) =>`
2. Respuestas de fetch sin tipar: `const data = await res.json() as any` → crear interface o usar el tipo del endpoint
3. Acceso a propiedades de objetos de la store: tipar el slice de Zustand

> **TSC check tras Bloque 3:** debe ser 0

---

## Bloque 4 — API routes, utils y monitoring (17 instancias)

**Archivos:**
- `lib/validation-service.ts` — 4
- `lib/errors/handler.ts` — 3
- `lib/blacksheep-store.ts` — 5
- `lib/utils/class-generator.ts` — 2 (reducir con Prisma types)
- `lib/types/generator.ts` — 2
- `lib/monitoring/sentry.ts` — 1
- `lib/monitoring/performance-monitor.ts` — 1
- `lib/monitoring/logger.ts` — 1
- `app/api/users/[id]/renewal/approve/route.ts` — 2
- `app/api/admin/renewals/route.ts` — 2

**Nota sobre `lib/errors/handler.ts`:** Este archivo se toca también en HAL-14 (constraint names). Coordinar para no duplicar trabajo.

> **TSC final:** `tsc --noEmit 2>&1 | grep "error TS" | grep -v ".next/" | wc -l` → **debe ser 0**

---

## Proceso de ejecución

```
Sesión 1 (2026-04-26):
  ✅ lib/types.ts + add-student-modal.tsx — base organizationId
  ✅ user-repository.ts — 12 eliminados
  ✅ organization, discipline, instructor, renewal, plan repos — ~25 eliminados
  ✅ class-repository.ts — ~8 eliminados (residuales post HAL-03 Sprint A)
  Conteo real post Bloque 1: 131 → 92 (39 eliminados)
Sesión 2 (2026-04-26):
  ✅ HAL-14 — handler.ts: 3 as any eliminados (commit 79c96d0)
  Conteo real post HAL-14: 92 → 89
Sesión 3 (2026-04-26):
  ✅ Bloque 2 — provider-factory.ts (9), base-service.ts (6), class-service.ts (1 de 9)
  ⚠️  Nota: 8 instancias de `as any` en class-service.ts alrededor de ValidationService quedan pendientes para el Bloque 4.
  ✅ Bloque 3 (Parcial) — user-approval.tsx (13), user-profile.tsx (9)
  Conteo real post Sesión 3: 51
Sesión 4: Bloque 3 restante (14 en UI pages/components) + Bloque 4 (ValidationService, api routes, utils, store)
          TSC final → 0 errores → HAL-16 cerrado → 131 → 0
```

---

## Criterio de aceptación

```bash
grep -rn " as any" app/ lib/ components/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules|\.next" \
  | wc -l
# Esperado: 0
```

Y:
```bash
tsc --noEmit 2>&1 | grep "error TS" | grep -v ".next/" | wc -l
# Esperado: 0
```

---

## HAL-14 — Constraint Names Expuestos

> Estado: **✅ COMPLETO — 2026-04-26, commit `79c96d0`**
> Estimado: **0.5h** — Real: **~15 min**
> Archivo: `lib/errors/handler.ts`

### Problema

Cuando Prisma lanza `PrismaClientKnownRequestError` con código `P2002` (unique constraint violation), el campo `error.meta?.target` puede exponer el nombre interno del constraint de base de datos — por ejemplo `"class_sessions_disciplineId_dateTime_key"` — en la respuesta de la API en producción.

El código actual en `handlePrismaError` (L82-88) ya tiene `isDev` correctamente definido (L78), pero en producción devuelve `constraint: error.meta?.target` dentro de `details`:

```typescript
// handler.ts L82-87 — estado actual
case "P2002":
  return {
    code: ApiErrorCode.CONFLICT,
    message: "A record with this information already exists",
    details: isDev ? { constraint: error.meta?.target } : undefined,  // ✅ ya protegido
  };
```

**Revisión del código actual:** El handler ya aplica `isDev` correctamente en P2002 (L86), P2025 (L93) y P2003 (L100). **El leak no está en `handlePrismaError` — está en que `isPrismaError` (L203-211) usa `as any` para acceder a `.code`, y si el error llega por otro path podría bypassear el handler.**

### Los 3 `as any` en handler.ts

| Línea | Código | Fix |
|---|---|---|
| L61 | `handleZodError(error: any)` | `error: unknown` + acceso via `(error as { errors?: ...[] })` |
| L77 | `handlePrismaError(error: any)` | `error: unknown` + type guard interno |
| L199, L208-209 | `(error as any).name`, `(error as any).code` | narrowing con `'name' in error` y `'code' in error` (ya verificados en el if) |

### Fix concreto

```typescript
// Antes
private static handleZodError(error: any): ApiError { ... }
private static handlePrismaError(error: any): ApiError { ... }

// Después — error: unknown, acceso narrowed
private static handleZodError(error: unknown): ApiError {
  const zodErr = error as { errors?: { path?: string[]; message?: string }[] };
  const firstError = zodErr.errors?.[0];
  ...
}

private static handlePrismaError(error: unknown): ApiError {
  const prismaErr = error as { code?: string; meta?: Record<string, unknown> };
  const isDev = process.env.NODE_ENV === "development";
  switch (prismaErr.code) { ... }
}

// isZodError / isPrismaError — eliminar as any, ya tienen narrowing previo
private static isZodError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: unknown }).name === "ZodError"  // ← eliminar as any
  );
}
```

### Criterio de aceptación

```bash
grep -n " as any" lib/errors/handler.ts
# Esperado: 0 líneas

tsc --noEmit 2>&1 | grep "handler.ts" | grep "error TS"
# Esperado: vacío
```

Y verificar en producción que un error P2002 devuelve:
```json
{ "code": "CONFLICT", "message": "A record with this information already exists" }
// Sin campo "details" ni "constraint" expuesto
```

### Nota de coordinación con HAL-16 Bloque 4

`lib/errors/handler.ts` aparece en el conteo de HAL-16 con 3 `as any`. **Atacar HAL-14 primero** limpia estos 3 castings como efecto secundario — cuando llegue el Bloque 4 de HAL-16, este archivo ya estará en 0.
