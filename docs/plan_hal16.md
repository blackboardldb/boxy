# Plan de Trabajo — HAL-16: Eliminar casteos `as any`

> Estado: **EN COLA — HAL-03 ✅ Completo**
> Documento maestro: `vision_general_actualizada.md`
> Última actualización: 2026-04-26

---

## Contexto

**131 `as any` iniciales → 119 restantes** (conteo post Bloque 1 parcial — 2026-04-26).
Objetivo: llevar a 0 sin introducir regresiones.

**Progreso:**

| Bloque | Archivos | Inicial | Eliminados | Restantes |
|---|---|---|---|---|
| **Base** | `lib/types.ts`, `add-student-modal.tsx` | — | 0 `as any` (fix de tipo, no castings) | — |
| **Bloque 1 (parcial)** | `user-repository.ts` | 13 | 12 | 119 total |
| **Bloque 1 (pendiente)** | otros repos data-layer | ~26 | — | — |
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
| `components/admincomponents/user-approval.tsx` | 13 | ← siguiente |
| `lib/services/class-service.ts` | 9 | |
| `lib/data-layer/provider-factory.ts` | 9 | |
| `components/user-profile.tsx` | 9 | |
| `lib/services/base-service.ts` | 6 | |
| `lib/data-layer/repositories/organization-repository.ts` | 6 | |
| `lib/data-layer/repositories/discipline-repository.ts` | 6 | |
| `lib/data-layer/repositories/membership-renewal-repository.ts` | 5 | |
| `lib/data-layer/repositories/instructor-repository.ts` | 5 | |
| `lib/blacksheep-store.ts` | 5 | |
| `lib/validation-service.ts` | 4 | |
| `lib/errors/handler.ts` | 3 | |
| `lib/data-layer/repositories/plan-repository.ts` | 3 | |
| `app/admin/alumnos/[id]/nuevo-plan/page.tsx` | 3 | |
| `lib/utils/class-generator.ts` | 2 | |
| `lib/types/generator.ts` | 2 | |
| `lib/data-layer/repositories/class-repository.ts` | 2 | |
| `components/admincomponents/add-student-modal.tsx` | 2 | |
| `app/api/users/[id]/renewal/approve/route.ts` | 2 | |
| `app/api/admin/renewals/route.ts` | 2 | |
| `lib/data-layer/repositories/user-repository.ts` | **0** | ✅ Bloque 1 completo |

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
  ✅ user-repository.ts — 12 as any eliminados (131 → 119)
Sesión 2: Bloque 1 completo — repos data-layer restantes (organization, discipline, membership-renewal, instructor, plan, class)
Sesión 3: Bloque 2 — Services y provider-factory
Sesión 4: Bloque 3 — Components y Pages (user-approval.tsx, user-profile.tsx)
Sesión 5: Bloque 4 — API routes, utils, monitoring
          TSC final → 0 errores → HAL-16 cerrado
          HAL-14 desbloqueado
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
