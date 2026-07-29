# Boxy — Arquitectura de Seguridad Multi-Tenant

> Documento técnico de referencia. Describe los controles de seguridad implementados en la plataforma, los patrones de aislamiento entre tenants (centros), y las decisiones de diseño que los sustentan.

---

## Modelo de aislamiento

Boxy opera con una base de datos compartida y aislamiento lógico por `organizationId`. Cada fila de las tablas de negocio (`ClassSession`, `UserMembership`, `MembershipRenewal`, `Expense`, etc.) lleva `organizationId` como columna de scope. El sistema garantiza en tres capas que ningún centro puede leer ni escribir datos de otro.

### Capa 1 — Guard de autenticación

```typescript
// lib/supabase/auth-guard.ts
const auth = await requireAuth();   // alumno autenticado
const auth = await requireAdmin();  // admin/coach del centro
```

Ambos devuelven `{ user, organizationId }` extraído del token de Supabase. El `organizationId` es la fuente de verdad para toda la sesión. El payload del cliente nunca lo puede sobreescribir.

### Capa 2 — Scope en queries de Prisma

Toda query que accede a datos de un centro incluye el filtro:

```typescript
where: { organizationId: auth.organizationId }
```

Las FKs de entidades scoped (disciplinas, instructores) se validan antes de usarlas:

```typescript
const discipline = await prisma.discipline.findFirst({
  where: { id: parsed.data.disciplineId, organizationId: auth.organizationId }
});
if (!discipline) return NextResponse.json({ error: "Not found" }, { status: 404 });
```

### Capa 3 — Relaciones anidadas (`include`)

Los `include` de Prisma que traen relaciones de membresía o renovaciones incluyen `where: { organizationId }` anidado para no arrastrar datos de otros centros:

```typescript
include: {
  userMembership: { where: { organizationId } },
  membershipRenewals: { where: { organizationId } },
  memberships: true // solo para guard de pertenencia
}
```

El mapper `mapToEntity(user, organizationId)` recibe siempre el segundo argumento para no caer en el acceso por índice `[0]` que era el origen de las fugas cross-tenant.

---

## Patrones prohibidos

Los siguientes patrones fueron identificados como vectores de vulnerabilidad y erradicados del codebase. No deben reaparecer en código nuevo.

### ❌ `findUnique` sin `organizationId`

```typescript
// INCORRECTO — permite acceder a entidades de cualquier centro
const session = await prisma.classSession.findUnique({ where: { id: classId } });

// CORRECTO
const session = await prisma.classSession.findFirst({
  where: { id: classId, organizationId: auth.organizationId }
});
```

### ❌ `organizationId` del payload

```typescript
// INCORRECTO — el cliente decide en qué centro opera
const { organizationId } = await req.json();
await prisma.classSession.updateMany({ where: { organizationId, date } });

// CORRECTO
const { organizationId } = auth;
```

### ❌ `[0]` arbitrario en arrays multi-tenant

```typescript
// INCORRECTO — si el usuario pertenece a 2 centros, [0] es no determinista
const orgId = dbUser.memberships?.[0]?.organizationId;

// CORRECTO — usar el organizationId del token
const { organizationId } = auth;
```

### ❌ `supabase.auth.getUser()` directo en endpoints

```typescript
// INCORRECTO — no extrae organizationId de forma confiable
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// CORRECTO
const auth = await requireAuth();
if ("error" in auth) return NextResponse.json(...);
```

### ❌ `error?.message` expuesto al cliente

```typescript
// INCORRECTO — fuga de detalles internos (constraint names, field names)
} catch (error: any) {
  return NextResponse.json({ error: error?.message }, { status: 500 });
}

// CORRECTO
} catch (error) {
  return ErrorHandler.createResponse(error, {
    operation: "nombre",
    resource: "entidad",
  });
}
```

### ❌ Fechas UTC fijas en operaciones de calendario

```typescript
// INCORRECTO — desfase de ±4h en horario chileno
gte: new Date(`${date}T00:00:00.000Z`)

// CORRECTO
gte: startOfDayChile(date)  // lib/utils/dates.ts
lt:  endOfDayChile(date)
```

### ❌ WebSocket room construido desde el payload

```typescript
// INCORRECTO — el atacante controla a qué room se emite el evento
const { organizationId } = await req.json();
io.to(`org_${organizationId}`).emit("classUpdated", data);

// CORRECTO
io.to(`org_${auth.organizationId}`).emit("classUpdated", data);
```

---

## Gestión de usuarios multi-centro

Un mismo email puede pertenecer a múltiples centros con roles distintos. Las reglas:

- **`OrganizationMember`** — determina si el usuario pertenece al centro (guard de acceso).
- **`UserMembership`** — determina el plan y estado de membresía en ese centro.
- **`MembershipRenewal`** — historial de pagos del usuario en ese centro.

Todas estas tablas tienen `organizationId`. El guard de pertenencia siempre usa `memberships.some(m => m.organizationId === auth.organizationId)`, nunca la existencia de un plan activo.

### Soft delete multi-centro

Eliminar a un alumno de un centro no borra el usuario global si tiene otros centros activos:

1. Se marca `OrganizationMember` y `UserMembership` como `inactive` para ese centro.
2. Se cuenta si quedan otros centros activos.
3. Solo si no quedan centros activos: `user.deletedAt = new Date()` + revocación en Supabase Auth.

---

## Cancelación masiva de clases

Los endpoints de cancelación masiva (`cancel-day`, `cancel-bulk`) son de alto riesgo porque operan sobre múltiples filas. Controles implementados:

- Requieren `requireAdmin()` (no solo `requireAuth()`).
- El `organizationId` se fuerza desde `auth.organizationId`, no del payload.
- Los rangos de fecha usan `startOfDayChile`/`endOfDayChile`.
- Los eventos WebSocket se emiten solo al room `org_${auth.organizationId}`.

**Deuda técnica documentada** (no crítica de seguridad): al cancelar una sesión con alumnos inscritos, `ClassRegistration` no se actualiza automáticamente. Es una deuda funcional pendiente de resolución en una iteración separada.

---

## Generación de clases

El endpoint `POST /api/classes/generate` y `POST /api/classes/persist-generated` aceptan lotes de clases generadas por el cliente. Controles:

- Se valida que `disciplineId` e `instructorId` pertenezcan al tenant antes del loop de creación.
- `organizationId` en el payload se ignora; se usa `auth.organizationId`.
- Fetch interno a `persist-generated` incluye los cookies de sesión para mantener la autenticación.

---

## Validación de cupos (`validation-service.ts`)

La validación de disponibilidad de cupos en clases consulta exclusivamente dentro del `organizationId` de la clase destino:

```typescript
class: { organizationId: classSession.organizationId }
```

Esto previene que alumnos de un centro "consuman" cupos o validen límites cruzando a clases de otro centro.

---

## Records de levantamiento (RM)

Los registros de RM (`UserLift`) están scoped por `organizationId`. Un alumno que va a dos centros tiene RMs independientes por centro, evitando que el historial de un centro sea visible desde el otro.

---

## Manejo de errores centralizado

Todos los endpoints usan `ErrorHandler.createResponse(error, context)` de `lib/errors/handler.ts`. Este handler:

- En desarrollo (`isDev`): incluye el stack trace.
- En producción: devuelve solo un código genérico (`INTERNAL_ERROR`), sin detalles de implementación.
- Captura la excepción en Sentry automáticamente si está configurado.

---

## Checklist para nuevos endpoints

Antes de mergear un endpoint nuevo, verificar:

- [ ] ¿Usa `requireAuth()` o `requireAdmin()` (nunca `supabase.auth.getUser()` directo)?
- [ ] ¿El payload se valida con `zod.safeParse()` antes de procesar?
- [ ] ¿Todas las queries a Prisma incluyen `organizationId: auth.organizationId`?
- [ ] ¿Los `include` anidados de relaciones multi-tenant tienen `where: { organizationId }`?
- [ ] ¿El catch usa `ErrorHandler.createResponse` (no `error?.message`)?
- [ ] ¿Los eventos WebSocket usan `org_${auth.organizationId}` como room?
- [ ] ¿Las fechas usan `startOfDayChile`/`endOfDayChile` en vez de UTC fijo?
