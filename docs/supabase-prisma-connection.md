# Conexión Supabase + Prisma — BS Plataforma

> **Fecha de configuración:** 2026-03-23  
> **Proyecto Supabase:** `bs-plataforma-prod`  
> **Organización:** `bsheepla`  
> **Project Ref:** `xkibqawnrolrnnxaxmze`  
> **Región:** South America (São Paulo) — `aws-1-sa-east-1`

---

## Stack de Base de Datos

| Capa | Tecnología | Rol |
|---|---|---|
| Base de datos | **PostgreSQL** (hosteado en Supabase) | Persistencia real |
| ORM | **Prisma v6** | Acceso tipado desde Next.js |
| Pooler | **Supavisor** (Supabase) | Connection pooling para el runtime |
| Cliente JS | **@supabase/supabase-js** | Auth y acceso directo desde el browser |

---

## Variables de Entorno (`.env`)

```env
# ─── SUPABASE ─────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xkibqawnrolrnnxaxmze.supabase.co

# Anon key (JWT role: anon) — segura para exponer en el cliente
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  # JWT largo

# Publishable key (nuevo formato SSR de Supabase)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...

# Service Role key (JWT role: service_role) — SOLO en servidor
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # JWT largo

# ─── PRISMA + SUPABASE ────────────────────────────────────
# Transaction mode (puerto 6543) — para el runtime de Next.js
DATABASE_URL=postgresql://postgres.xkibqawnrolrnnxaxmze:[pass]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Session mode (puerto 5432) — para migraciones con Prisma CLI
DIRECT_URL=postgresql://postgres.xkibqawnrolrnnxaxmze:[pass]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

# ─── APP CONFIG ───────────────────────────────────────────
DATA_PROVIDER=prisma
```

> **Importante:** El password contiene caracteres especiales (`/`, `&`) que deben estar **URL-encodeados** en el connection string:
> - `/` → `%2F`
> - `&` → `%26`

---

## Configuración de `prisma/schema.prisma`

El `datasource` requiere **dos URLs** para funcionar correctamente con Supabase:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Puerto 6543 — runtime (PgBouncer)
  directUrl = env("DIRECT_URL")     // Puerto 5432 — migraciones CLI
}
```

> **¿Por qué dos URLs?**  
> PgBouncer (puerto 6543, Transaction mode) no soporta las operaciones de migración de Prisma (`ALTER TABLE`, `CREATE INDEX`, etc). El `directUrl` apunta al pooler en modo Session (puerto 5432) que sí las soporta.

---

## Por qué el puerto 5432 directo (`db.supabase.co`) no funciona

El plan **Free de Supabase** bloquea las conexiones directas al servidor PostgreSQL (`db.xkibqawnrolrnnxaxmze.supabase.co:5432`). Solo el Supavisor/pooler está disponible:

| URL | Puerto | Usar para |
|---|---|---|
| `aws-1-sa-east-1.pooler.supabase.com` | `6543` | Runtime Next.js (Transaction) |
| `aws-1-sa-east-1.pooler.supabase.com` | `5432` | Migraciones Prisma CLI (Session) |
| `db.xkibqawnrolrnnxaxmze.supabase.co` | `5432` | ❌ Bloqueado en plan Free |

> El host correcto del pooler para este proyecto es **`aws-1-sa-east-1`** (no `aws-0`). Este valor es específico por proyecto y se encuentra en **Supabase Dashboard → Settings → Database**.

---

## Cómo se crearon las tablas

**El problema:** `prisma migrate dev` requiere una conexión directa al servidor que está bloqueada en el plan Free.

**La solución:** Generar el SQL de migración localmente y ejecutarlo en el **SQL Editor** de Supabase.

```bash
# 1. Generar el SQL limpio (2>/dev/null elimina warnings de Prisma del output)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script 2>/dev/null | pbcopy

# 2. El SQL queda en el portapapeles → pegar en:
# https://supabase.com/dashboard/project/xkibqawnrolrnnxaxmze/sql/new
# → Click "Run" → "Success. No rows returned"
```

### Tablas creadas (11 en total)

| Tabla | Descripción |
|---|---|
| `users` | Usuarios (alumnos y admins) |
| `class_sessions` | Clases físicas programadas |
| `disciplines` | Disciplinas (CrossFit, Yoga, etc.) |
| `instructors` | Instructores |
| `membership_plans` | Planes de membresía disponibles |
| `organizations` | Multi-tenant (una org por gimnasio) |
| `class_registrations` | Inscripciones de usuarios a clases |
| `membership_renewals` | Historial de renovaciones |
| `system_logs` | Audit trail y monitoreo |
| `performance_metrics` | Métricas de rendimiento |
| `expenses` | Gastos del negocio |

---

## Generación del Prisma Client

```bash
npx prisma generate
# ✔ Generated Prisma Client (v6.19.2)
```

El client queda en `node_modules/.pnpm/@prisma+client@6.19.2_...`

---

## Verificación de conexión

```bash
node --env-file=.env -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'\`
  .then(r => console.log('✅ Tablas:', r[0].count.toString()))
  .finally(() => prisma.\$disconnect());
"
# Output: ✅ Tablas: 11
```

---

## Comandos útiles de referencia

```bash
# Regenerar cliente después de cambios al schema
npx prisma generate

# Ver las tablas en modo visual
npx prisma studio

# Generar SQL de una nueva migración sin aplicarla
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script 2>/dev/null

# Ver estado de migraciones
npx prisma migrate status

# Seed de datos iniciales
npx prisma db seed
```

---

## Consideraciones de Seguridad

- ✅ `SUPABASE_SERVICE_ROLE_KEY` solo se usa en API Routes del servidor (nunca en el cliente)
- ✅ `.env` está en `.gitignore` — las keys no se suben a GitHub
- ⚠️ **Para producción en Vercel:** agregar todas las variables en **Vercel → Settings → Environment Variables**
- ⚠️ **RLS (Row Level Security):** pendiente de activar en Supabase para proteger acceso directo desde el browser

---

*Última actualización: 2026-03-23*
