# Plan de Trabajo — Evolución de HAL-06b a HAL-03

> Estado: **HAL-06b ✅ | HAL-03 ✅ COMPLETO — HAL-16 siguiente**
> Documento maestro: `vision_general_actualizada.md`
> Última actualización: 2026-04-26

---

## HAL-06b — Validación Zod (COMPLETADO)

### Contexto
- **47 archivos** auditados en `app/api/`
- **3 rutas** ya tienen Zod: `api/users`, `api/instructors`, `api/me/change-password`
- **90% de schemas** ya existen en `lib/schemas.ts` — el trabajo es mayormente importar y conectar
- **2 schemas nuevos** a crear: `createExpenseSchema`, `createInAppAlertSchema`

### Patrón uniforme a aplicar
```typescript
const parsed = schema.safeParse(await request.json());
if (!parsed.success) {
  return NextResponse.json(
    { success: false, error: parsed.error.errors[0].message },
    { status: 400 }
  );
}
const body = parsed.data;
```

### Rutas excluidas (GET-only confirmadas, sin body)
`alerts/route.ts`, `admin/stats`, `members/expired`, `members/expiring`,
`classes/by-date`, `me/history`, `system/health`, `auth/logout`,
`users/email/[email]`, `users/stats`, `users/[id]/classes`, `classes/[id]/participants`,
`admin/renewals` (GET-only), `admin/members/*`, `cron/*`, `sentry-example-api`,
`emit-event`, `push/subscribe` (body no sensible)

---

### Bloque 1 — `users/` y `renewal/` (schemas disponibles ✅)

| Ruta | Método | Schema a usar |
|------|--------|---------------|
| `users/[id]/route.ts` | PATCH | `updateUserSchema` |
| `users/[id]/renewal/route.ts` | POST | `createMembershipRenewalSchema` |
| `users/[id]/renewal/approve/route.ts` | POST | nuevo `approveRenewalSchema` (inline simple) |
| `users/[id]/renewal/reject/route.ts` | POST | nuevo `rejectRenewalSchema` (inline simple) |
| `users/[id]/reset-password/route.ts` | POST | solo `{ userId }` — validar inline |

> **TSC check** tras bloque 1: `tsc --noEmit | grep "error TS" | wc -l`

---

### Bloque 2 — `classes/` y `register/` (schemas disponibles ✅)

| Ruta | Método | Schema a usar |
|------|--------|---------------|
| `classes/route.ts` | POST | `createClassSessionSchema` |
| `classes/[id]/route.ts` | PATCH/DELETE | `updateClassSessionSchema` |
| `classes/[id]/register/route.ts` | POST | `{ userId: string }` — inline simple |
| `classes/[id]/admin/register/route.ts` | POST | `{ userId: string }` — inline simple |
| `classes/[id]/cancel/route.ts` | POST | `{ reason?: string }` — inline simple |
| `classes/[id]/admin/cancel/route.ts` | POST | `{ reason?: string }` — inline simple |
| `classes/[id]/notes/route.ts` | PATCH | `{ notes: string }` — inline simple |
| `classes/cancel/route.ts` | POST | `{ classId: string }` — inline simple |
| `classes/admin/cancel-bulk/route.ts` | POST | `{ date: string }` — inline simple |
| `classes/generate/route.ts` | POST | `{ weekStart: string, ... }` — inline simple |
| `classes/generate-auto/route.ts` | POST | sin body complejo — inline simple |
| `classes/persist-generated/route.ts` | POST | array de clases — usar `z.array(createClassSessionSchema)` |
| `classes/process-finished/route.ts` | POST | sin body — no aplica |

> **TSC check** tras bloque 2

---

### Bloque 3 — `disciplines/` y `plans/` (schemas disponibles ✅)

| Ruta | Método | Schema a usar |
|------|--------|---------------|
| `disciplines/route.ts` | POST | `createDisciplineSchema` |
| `disciplines/[id]/route.ts` | PATCH/DELETE | `updateDisciplineSchema` |
| `plans/route.ts` | POST | `createPlanSchema` |
| `plans/[id]/route.ts` | PATCH/DELETE | `updatePlanSchema` |
| `organization/route.ts` | PATCH | `updateOrganizationSchema` |
| `instructors/[id]/route.ts` | PATCH/DELETE | `updateInstructorSchema` |
| `instructors/[id]/status/route.ts` | PATCH | `{ isActive: boolean }` — inline simple |
| `me/route.ts` | PATCH | `updateUserSchema.partial()` |

> **TSC check** tras bloque 3

---

### Bloque 4 — `expenses/` y `admin/alerts/` (schemas nuevos)

**Primero agregar a `lib/schemas.ts`:**

```typescript
// Expense
export const createExpenseSchema = z.object({
  motivo: z.string().min(1, "El motivo es requerido"),
  fecha:  z.string().min(1, "Fecha inválida"),
  monto:  z.number().positive("El monto debe ser positivo"),
});
export const updateExpenseSchema = createExpenseSchema.partial();
export type CreateExpense = z.infer<typeof createExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

// InAppAlert
export const createInAppAlertSchema = z.object({
  title:     z.string().min(1),
  content:   z.string().min(1),
  type:      z.string().min(1),
  startDate: z.string().min(1),
  endDate:   z.string().min(1),
});
export const updateInAppAlertSchema = createInAppAlertSchema.partial();
export type CreateInAppAlert = z.infer<typeof createInAppAlertSchema>;
export type UpdateInAppAlert = z.infer<typeof updateInAppAlertSchema>;
```

**Rutas a conectar:**

| Ruta | Método | Schema a usar |
|------|--------|---------------|
| `expenses/route.ts` | POST | `createExpenseSchema` |
| `expenses/[id]/route.ts` | PATCH/DELETE | `updateExpenseSchema` |
| `admin/alerts/route.ts` | POST | `createInAppAlertSchema` |
| `admin/alerts/[id]/route.ts` | PATCH/DELETE | `updateInAppAlertSchema` |

> **TSC final**: `tsc --noEmit | grep "error TS" | grep -v ".next/" | wc -l` → debe ser 0

---

### Estado Final HAL-06b
Los 4 bloques fueron implementados. Se resolvieron regresiones críticas donde los esquemas Zod diferían de los payloads del frontend (ejs. `[id]/register` inline, `startDate` y `fecha` relax de `.datetime()` a `.min(1)`, nombres de Prisma reemplazados por UI payloads en `createPlanSchema`). App 100% estabilizada.

---

## HAL-03 — Arrays denormalizados en `ClassSession`

### Estado
**✅ Auditoría completa. Listo para Sesión 2.**

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
Sesión 1: Auditoría ✅ COMPLETA
Sesión 2: Backup + verificación de datos ✅ COMPLETA
Sesión 3: Sprint A — Mapper dual-read (ClassRegistration como fuente, arrays como fallback) ✅ COMPLETA
Sesión 4: Sprint B — Eliminar writes a los arrays ✅ COMPLETA
          ✅ Observación 24-48h sin incidentes — CUARENTENA SUPERADA
Sesión 5: Sprint C — DROP de columnas en Prisma ← PRÓXIMO PASO
```

---

### Sesión 2 — Backup y verificación ✅ COMPLETA

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

### Sesión 3 — Sprint A: Mapper dual-read ✅ COMPLETA

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

### Sesión 4 — Sprint B: Eliminar writes + observación ✅ COMPLETA

**Objetivo:** Ningún route ni service escribe en los arrays. Solo `ClassRegistration` recibe writes.

En `class-service.ts` — eliminados los bloques push/filter sobre arrays en `registerStudent` y `cancelRegistration`. ✅  
En `api/classes/generate`, `persist-generated`, `route.ts` — eliminado hardcodeo de arrays vacíos al crear clases. ✅

**✅ Fix adicional aplicado (2026-04-26):** `lib/services/discipline-service.ts` — reemplazado filtro Prisma sobre columna array:
```typescript
// ❌ ANTES — bloqueaba el DROP
registeredParticipantsIds: { equals: [] }

// ✅ DESPUÉS — Prisma relacional puro
registrations: { none: { status: 'registered' } }
```

**✅ Observación 24-48h sin incidentes — CUARENTENA SUPERADA. Sprint C desbloqueado.**

---

### Sesión 5 — Sprint C: DROP de columnas ✅ COMPLETO (2026-04-26)

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
-- Resultado obtenido: 0 filas ✅
```

**Verificaciones adicionales post-DROP (2026-04-26):**
- `tsc --noEmit` → **0 errores** ✅
- `generate-auto` para 2026-04-27/2026-05-11 → **clases generadas correctamente** ✅
- `discipline-service.ts` — filtro Prisma migrado a `registrations: { none: { status: 'registered' } }` ✅

---

### HAL-03 — CERRADO ✅
> HAL-16 es el siguiente paso según `vision_general_actualizada.md`.
