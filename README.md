# Boxy — Plataforma SaaS Multi-Tenant para Centros Fitness

Boxy es un sistema de gestión integral para centros de fitness (CrossFit, funcional, pilates, etc.) construido como una plataforma **multi-tenant nativa**. Cada centro opera en su propio espacio de datos completamente aislado, sin posibilidad de que un centro acceda a la información de otro.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Base de datos | PostgreSQL vía Prisma ORM |
| Autenticación | Supabase Auth |
| UI | ShadCN + Tailwind CSS |
| Estado cliente | Zustand |
| Validación | Zod (todos los payloads de escritura) |
| Tiempo real | Socket.IO (Pages Router `/pages/api/socket`) |
| Push | Web Push API |
| Monitoreo | Sentry |
| Runtime | Node.js 18+ / pnpm |

---

## Arquitectura Multi-Tenant

Boxy utiliza un modelo **shared database, separate schema lógico por tenant**. El aislamiento se garantiza en tres capas:

### 1. Autenticación (Guard Layer)

Todos los endpoints de escritura y lectura de datos de negocio pasan por uno de estos guards antes de tocar la base de datos:

```typescript
// Para alumnos (lectura propia)
const auth = await requireAuth();

// Para administradores del centro
const auth = await requireAdmin();

// Para superadmin / manager de plataforma
await requireManager();
```

`requireAuth()` y `requireAdmin()` devuelven `{ user, organizationId }` — el `organizationId` es el único que se usa en todas las queries. El payload del cliente se descarta o se sobreescribe.

### 2. Scope en Queries (Data Layer)

Toda query a Prisma que filtra datos de un centro incluye `organizationId: auth.organizationId`. Nunca se acepta `organizationId` del body del cliente para operaciones de acceso o mutación.

```typescript
// ✅ Patrón correcto
await prisma.classSession.findFirst({
  where: { id: classId, organizationId: auth.organizationId }
});

// ❌ Patrón incorrecto (erradicado)
await prisma.classSession.findUnique({ where: { id: classId } });
```

### 3. Relaciones Anidadas (Include Layer)

Las queries con `include` filtran las relaciones anidadas para no arrastrar datos de otros centros:

```typescript
// ✅ Patrón correcto
include: {
  userMembership: { where: { organizationId } },
  membershipRenewals: { where: { organizationId } },
  memberships: true  // solo para guard de pertenencia, no se devuelve raw
}
```

---

## Estructura del Proyecto

```
boxy/
├── app/
│   ├── admin/              # Panel del centro (rutas protegidas por ADMIN/COACH)
│   ├── app/                # Vista del alumno
│   ├── manager/            # Superadmin de plataforma
│   └── api/                # API Routes (App Router)
│       ├── admin/          # Endpoints exclusivos de admin
│       ├── classes/        # Clases, cancelaciones, generación
│       ├── disciplines/    # Disciplinas del centro
│       ├── expenses/       # Gastos del centro
│       ├── finances/       # Finanzas (ingresos)
│       ├── instructors/    # Instructores
│       ├── manager/        # API de superadmin
│       ├── me/             # Datos propios del alumno autenticado
│       ├── organization/   # Configuración del centro
│       ├── plans/          # Planes de membresía
│       ├── push/           # Notificaciones push
│       ├── rm/             # Records de levantamiento (RM)
│       ├── routines/       # Rutinas y asignaciones
│       ├── routine-templates/ # Plantillas de rutinas
│       ├── users/          # Gestión de alumnos
│       └── tenant/         # Info del tenant activo
├── components/
│   ├── admincomponents/    # Componentes del panel admin
│   └── ui/                 # Componentes base (ShadCN)
├── lib/
│   ├── supabase/           # Clients y guards de auth
│   │   └── auth-guard.ts   # requireAuth() / requireAdmin()
│   ├── services/           # Servicios de dominio (Prisma directo)
│   │   ├── user-service.ts
│   │   ├── class-service.ts
│   │   ├── manager-service.ts
│   │   └── routine-service.ts
│   ├── errors/             # ErrorHandler centralizado
│   ├── utils/
│   │   └── dates.ts        # startOfDayChile / endOfDayChile (UTC-4)
│   ├── validation-service.ts # Validación de cupos y reglas de negocio
│   └── schemas.ts          # Schemas Zod compartidos
├── pages/
│   └── api/socket/         # WebSocket (Socket.IO, Pages Router)
└── prisma/
    └── schema.prisma       # Schema multi-tenant
```

---

## Roles

| Rol | Scope | Descripción |
|---|---|---|
| `ALUMNO` | Por centro | Alumno del centro. Puede reservar clases, ver su perfil e historial. |
| `COACH` | Por centro | Puede gestionar clases y ver alumnos de su centro. |
| `ADMIN` | Por centro | Acceso completo al panel del centro: alumnos, finanzas, clases, planes. |
| Manager | Global | Superadmin de plataforma Boxy. Ve y gestiona todos los centros. |

Un mismo usuario (email) puede pertenecer a múltiples centros con roles distintos en cada uno. El `organizationId` del token de sesión determina siempre el contexto activo.

---

## Convenciones de Desarrollo

### Guards obligatorios
- Todo endpoint de escritura (`POST`, `PUT`, `PATCH`, `DELETE`) requiere al menos `requireAuth()`.
- Todo endpoint admin requiere `requireAdmin()`.
- Nunca usar `supabase.auth.getUser()` directamente en un endpoint — siempre pasar por los guards de `auth-guard.ts`.

### Validación de payload
- Todo cuerpo de request en endpoints de escritura usa `zod.safeParse()` antes de procesar.
- El `organizationId` nunca se lee del body del cliente — siempre de `auth.organizationId`.
- Las FKs de entidades scoped al tenant (disciplinas, instructores) se validan con `findFirst({ where: { id, organizationId } })` antes de usarlas.

### Manejo de errores
```typescript
// Patrón estándar — nunca exponer error.message al cliente
} catch (error) {
  return ErrorHandler.createResponse(error, {
    operation: "nombreOperacion",
    resource: "entidad",
    metadata: { id },
  });
}
```

### Fechas y timezone
- El servidor opera en **UTC-4 (Chile/Santiago)**.
- Para rangos de día usar siempre `startOfDayChile(date)` / `endOfDayChile(date)` de `lib/utils/dates.ts`.
- Nunca construir rangos manuales con `T00:00:00.000Z` fijo.

### WebSockets
- Los eventos de cancelación/actualización de clases se emiten a `room: org_${auth.organizationId}`.
- Nunca usar el `organizationId` del payload para construir el room — siempre el del token.

---

## Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# WebPush
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."

# Sentry (opcional)
SENTRY_DSN="..."
NEXT_PUBLIC_SENTRY_DSN="..."

# Manager (superadmin)
MANAGER_SECRET="..."
```

---

## Comandos

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción (incluye prisma generate)
pnpm lint             # Linting
pnpm db:generate      # Regenerar cliente Prisma
pnpm db:push          # Sincronizar schema con la BD (sin migraciones)
pnpm db:studio        # Prisma Studio (explorador visual)
pnpm db:reset         # Reset completo de BD (¡destructivo!)
pnpm sync:auth        # Sincronizar usuarios de Supabase Auth con la BD local
```

---

## Estados de Membresía

```
active      — Membresía vigente
pending     — Pendiente de aprobación por el admin
scheduled   — Aprobada pero aún no iniciada (fecha futura)
expired     — Período vencido
frozen      — Congelada temporalmente
suspended   — Suspendida por el admin
inactive    — Dada de baja
```

---

*Boxy — plataforma SaaS multi-tenant para centros fitness.*
