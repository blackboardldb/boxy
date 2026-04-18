# BS Plataforma — Documento Maestro de Deuda Técnica y Roadmap

> **Nota:** Este documento consolida y reemplaza los análisis anteriores (`hal01_fase4_analisis_completo`, `roadmap_completo_bs_plataforma`, `vision_general_actualizada`). Los documentos previos quedan obsoletos y pasan a ser de referencia histórica.
> **Fuentes:** Auditoría original 2026-04-06 + tracking de commits + scan de código 2026-04-15 + correcciones de riesgo para Fase 4.

---

## Estado de todos los HALs

| HAL | Título | Estado | Commit/Ref |
|---|---|---|---|
| HAL-01 | JSONB `membership` → `UserMembership` | 🟡 Fase 4 en etapa de observación (código completo pre-DROP). | Pre-Drop: `3fb45ac` |
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
| HAL-12 | Contraseñas hardcodeadas | 🟠 Parcial — env vars con fallback | `be256f9` |
| HAL-13 | Logger sin persistencia | 🟡 Parcial — Sentry activo (beforeSend, 0.1 traces) | — |
| HAL-14 | Constraint names expuestos | 🟠 Parcial — `isDev` condicionado | `567283a` |
| **HAL-15** | **84 errores TSC** | **❌ Pendiente** | — |
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
| Completar 24-48 horas de observación sin errores o crasheos | ⏳ Observación en curso |
| **PUNTO DE NO RETORNO:** `ALTER TABLE users DROP COLUMN membership;` directa en BD | 🔒 Esperando finalización de periodo |
| Eliminar columna `membership Json?` de schema.prisma + `prisma generate` | 🔒 Esperando finalización de periodo |

---

### Estado de Eliminación Efectivo de Referencias (Check de Seguridad)
El escrutinio mediante *grep test* entregó resultados nominales. Todas las dependencias residuales consisten en lecturas pasivas desde la variable mapeada que proveen los `findUnique()` e interceptan los Typescript Interfaces a nivel UI; el "Dual Write" original ha sido exterminado.

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
