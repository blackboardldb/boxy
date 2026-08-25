# Boxy — Seguridad y Aislamiento Multi-Tenant

> Patrones de seguridad vigentes y prohibidos. Ver ARCHITECTURE.md para el modelo de datos y CHANGELOG.md para el historial de fixes que originaron estas reglas.

## Guards — nombres reales

```typescript
// lib/supabase/auth-guard.ts
const auth = await requireAuthFast(request);
const auth = await requireAdminFast(request);
const auth = await requireSelfOrAdminFast(request, targetUserId);

// Namespace /manager/ únicamente
const manager = await requireManager(); // devuelve { role: "OWNER" | "SUPPORT" }
```

## Patrones prohibidos (erradicados, no deben reaparecer)

### ❌ `findUnique`/`findFirst` sin `organizationId`

```typescript
// INCORRECTO
const session = await prisma.classSession.findUnique({ where: { id: classId } });

// CORRECTO
const session = await prisma.classSession.findFirst({
  where: { id: classId, organizationId: auth.organizationId }
});
```

### ❌ `organizationId` tomado del payload del cliente

```typescript
// INCORRECTO
const { organizationId } = await req.json();

// CORRECTO
const { organizationId } = auth; // siempre del guard, nunca del body
```

### ❌ `where: any` para construir filtros dinámicos

Prohibido. Fue la causa raíz de un IDOR real en `getClassById` (parámetro opcional + condicional silencioso). El tipado estricto de Prisma debe forzar que `organizationId` esté presente:

```typescript
// INCORRECTO
const where: any = { id };
if (organizationId) where.organizationId = organizationId;

// CORRECTO — organizationId no-opcional en la firma, imposible de omitir
async function getClassById(id: string, organizationId: string) {
  return prisma.classSession.findFirst({ where: { id, organizationId }, select: defaultSelect });
}
```

### ❌ Scope de tenant solo en el `include`, no en el `where` principal

Causa raíz de un fail-open real en `getUserScopedToOrg`: el filtro vivía en `include: { userMembership: { where: { organizationId } } }`, pero el `findUnique` externo encontraba el usuario igual (global) y nunca retornaba `null` para tenant incorrecto.

```typescript
// INCORRECTO — el filtro en el include no bloquea el hallazgo del usuario
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { userMembership: { where: { organizationId } } }
});
return user; // devuelve al usuario aunque no pertenezca al tenant

// CORRECTO — validar pertenencia explícita antes de retornar
if (!user) return null;
const belongsToOrg = user.memberships.some(m => m.organizationId === organizationId);
if (!belongsToOrg) return null;
```

### ❌ `[0]` arbitrario en relaciones multi-tenant

```typescript
// INCORRECTO — no determinista si el usuario pertenece a 2+ centros
const orgId = dbUser.memberships?.[0]?.organizationId;

// CORRECTO
const { organizationId } = auth;
```

### ❌ `error?.message` expuesto al cliente

```typescript
// INCORRECTO
} catch (error: any) {
  return NextResponse.json({ error: error?.message }, { status: 500 });
}

// CORRECTO
} catch (error) {
  return ErrorHandler.createResponse(error, { operation: "nombre", resource: "entidad" });
}
```

## Enmascaramiento de PII por rol (Manager)

Datos B2B sensibles (`email`, `phone`, `address`, `ownerName`, `ownerLastName`, `ownerRut`) solo se exponen a rol `OWNER`. Fail-closed: si el rol no se pasa explícitamente, se asume `SUPPORT` y se enmascara.

```typescript
async getById(id: string, role: "OWNER" | "SUPPORT" = "SUPPORT"): Promise<OrgDetail | null> {
  const isOwner = role === "OWNER";
  return {
    // ...
    email: isOwner ? org.email : null,
    phone: isOwner ? org.phone : null,
    // el resto de campos sensibles, mismo patrón
  };
}
```

Los campos enmascarados devuelven `null`, nunca un string ofuscado (`"*** oculto"`) — mantiene la separación entre dato y presentación; la UI decide cómo mostrar la ausencia.

## Contraseñas

- Contraseñas por defecto por tenant: cifradas AES-256-GCM, IV único por registro, inicialización lazy de la key (falla en el primer uso real, no al importar el módulo — evita tumbar builds de Vercel si falta la env var).
- Reset de contraseña de alumno: requiere `requireAdminFast` + rol `ADMIN`, búsqueda scoped por PK compuesta `(userId, organizationId)`, valor obtenido del campo cifrado del tenant correcto (nunca hardcodeado), con auditoría en `SystemEvent`.
- Cambio de propia contraseña (`me/change-password`): exige re-autenticación (`signInWithPassword`) con la contraseña actual, usando un cliente Supabase aislado (`persistSession: false`) para no pisar la sesión activa si la verificación falla.

## Crons y proxy

Excepciones de bypass en `proxy.ts` deben ser lo más restrictivas posible. Toda ruta excluida de la validación de sesión **debe** implementar su propio secreto de verificación independiente (`CRON_SECRET` comparado explícitamente en el handler). Un `startsWith` amplio en el bypass es un riesgo si se agregan rutas nuevas bajo el mismo prefijo sin decidirlo a propósito — ver BACKLOG.md.

## Realtime / WebSocket

No implementado actualmente — ver ARCHITECTURE.md sección 11. Si se reintroduce, cualquier construcción de "room" debe usar `auth.organizationId`, nunca un valor del payload del cliente.

## Checklist para nuevos endpoints

- [ ] ¿Usa `requireAuthFast`/`requireAdminFast`/`requireSelfOrAdminFast` (nunca `supabase.auth.getUser()` directo)?
- [ ] ¿El payload se valida con `zod.safeParse()` antes de procesar?
- [ ] ¿Toda query a Prisma que toque datos de negocio incluye `organizationId: auth.organizationId`?
- [ ] ¿El `where` está tipado estrictamente (nunca `any`)?
- [ ] ¿El scope de tenant está en el `where` principal, no solo en un `include` anidado?
- [ ] ¿El catch usa `ErrorHandler.createResponse` (no `error.message` crudo)?
- [ ] ¿Las fechas de calendario usan `startOfDayChile`/`endOfDayChile`?
- [ ] Si el endpoint toca PII de manager, ¿respeta el enmascaramiento por rol?
