# Plan de Refactorización HAL-10: Zustand → React Query (TanStack Query)

## El Problema
Actualmente, `lib/blacksheep-store.ts` es un mega-archivo de ~1500 líneas. Actúa simultáneamente como:
1. **Estado del Servidor:** Ejecutando fetching, deduplicación, almacenamiento de datos de la API y manejo de errores/loading.
2. **Estado del Cliente:** Controlando componentes de la UI seleccionados temporalmente (ej. `selectedUser`).

Zustand es fantástico para el estado del cliente, pero es muy pobre para el manejo nativo del estado del servidor (Data Fetching). Esto nos obliga a reinventar la rueda constantemente con bloques repetitivos de `try/catch`, sincronización manual e interfaces acopladas.

## El Objetivo
Implementar **TanStack Query (React Query v5)** para manejar el 100% de la comunicación con la API.
Zustand se reducirá a menos de 100 líneas, siendo renombrado eventualmente a `ui-store.ts`, manejando **exclusivamente estado local de UI**.

## Estrategia de Migración: Strangler Fig Pattern (Por Dominios)
Para no colapsar la interfaz actual del panel administrador, migraremos dominio por dominio, reemplazando la dependencia de Zustand por hooks asíncronos bajo demanda.

### Fase 1: Infraestructura y Setup
- [x] 1. Instalar dependencias: `@tanstack/react-query` y `@tanstack/react-query-devtools`.
- [x] 2. Crear `lib/react-query/provider.tsx` y envolver el layout principal del Dashboard.
- [x] 3. Configurar Fetch client estándar centralizado (`api-client.ts`) para eliminar la repetición de configuración de requests y **tomar una decisión explícita sobre `cache: 'no-store'`**. (⚠️ *Riesgo silencioso:* React Query tiene su propio ciclo stale/refetch. Si el client deshabilita caché a nivel HTTP, duplicamos el problema. Hay que purgar los `cache: 'no-store'` del viejo store).

### Fase 2: Migración por Sprints (Dominios)

**Sprint A: Dominios Simples (Disciplinas y Planes)** ✅ `2026-04-26` — Validado en producción
- [x] 1. Crear queries y mutations para Disciplinas (`useDisciplines`, `useCreateDiscipline`, `useUpdateDiscipline`, `useDeleteDiscipline`).
- [x] 2. Migrar `DisciplinesManager` y `PlansManager` para consumir los nuevos hooks.
- [x] 3. Eliminar referencias de `useBlackSheepStore` en estos componentes. `tsc --noEmit` = 0 errores.
- [x] 4. Crear `usePlans` con filtros reactivos (debouncedSearch, activeFilter como queryKey). El `useEffect` manual de Zustand fue eliminado.
- [x] **Bugs post-deploy corregidos:**
  - `PATCH 405` → la API solo acepta `PUT`; hooks corregidos en `usePlans` y `useDisciplines`.
  - `[object Object]` en error de DELETE → `api-client.ts` ahora navega `errorData.error.message` correctamente.
  - Flujo completo validado: crear plan ✅ · editar plan ✅ · eliminar plan ✅

**Sprint B: Usuarios y Auth** ✅ `2026-04-26` — commit `875953d`
- [x] Crea `useMe` (staleTime:0, gcTime:5min) — `/api/me` siempre fresca
- [x] Crea `usePaginatedUsers` con queryKey `{page, limit, search, status}` + `placeholderData`
- [x] Crea `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`
- [x] Migra `lib/hooks/useCurrentUser.ts` — store eliminado, wrappea `useMe()`
- [x] Migra `admin/alumnos/page.tsx` — `useEffect` + `isLoading` manual eliminados
- [x] Migra `admin/finanzas/page.tsx` — `users/fetchUsers` del store eliminados
- [x] Migra `admin/clases/page.tsx` — `users/fetchUsers` del store eliminados
- [x] `tsc --noEmit` = 0 errores ✅ | grep limpio ✅

⏸ **Validación 24h:** `useMe` toca `/api/me` que promueve `scheduled→active`. Monitorear Sentry/logs 24h antes de Sprint C.

⏸ **Validación Explícita 24h:** `fetchMe` toca el flujo de login de alumno. Igual que en HAL-01 y HAL-03, detenernos aquí a observar logs en producción por 24h antes de seguir con Sprint C.

**Sprint C: Clases e Instructores**
- [ ] 1. Crear queries para Calendario (`useClasses`, con filtros robustos de fechas).
- [ ] 2. Implementar Optimistic Updates en las Mutaciones de Inscripción (`useRegisterClass`, `useCancelClass`) para UI instantánea.
- [ ] 3. Migrar Instructores (`useInstructors`).
- [ ] 4. Eliminar lógica de `blacksheep-store.ts`.

**Sprint D: Renovaciones, Egresos y Notificaciones**
- [x] **D-1** Migrar Egresos (`useEgresos`, `useCreateEgreso`, `useDeleteEgreso`) ✅ `2026-04-26` — commit `1aef685`
  - `expenses-manager.tsx`, `add-expense-modal.tsx`, `admin-dashboard.tsx`, `admin/finanzas/page.tsx` migrados
  - queryKey `["egresos", "list", { year, month }]` — caché por mes independiente
  - `useBlackSheepStore` eliminado de 4 consumidores. `tsc --noEmit` = 0 errores ✅
- [ ] **D-2** Migrar Alertas y Renovaciones (`useAlerts`, `useRenewals`) ⏳ _Espera Sprint B (depende de `users` y `classSessions`)_
- [ ] Eliminar lógica de `blacksheep-store.ts`.

### Fase 3: Purga Final
- [ ] 1. Eliminar por completo el `BlackSheepStore` asíncrono.
- [ ] 2. Crear un nuevo y diminuto `ui-store.ts` puramente síncrono si aún persisten estados globales UI.
- [ ] 3. Auditoría de performance final y eliminación de requests en cascada innecesarias.

---

## Ejecución Táctica Granular

### Fase 1 + Sprint A (En Progreso)

**Objetivo:** Establecer la infraestructura de TanStack Query y migrar los primeros dominios de bajo riesgo (Disciplinas y Planes), removiéndolos de Zustand.

#### 1. Archivos a Crear / Modificar
- **Crear** `lib/api-client.ts`:
  - Contendrá un `fetchClient` genérico.
  - *Decisión Crítica:* Dejar de inyectar `cache: 'no-store'` por defecto. Dejar que React Query maneje la invalidación en el cliente.
- **Crear** `lib/react-query/provider.tsx`:
  - Instanciará el `QueryClient`.
  - Definirá defaults razonables (ej. `staleTime: 1000 * 60 * 5`, `refetchOnWindowFocus: false`).
- **Modificar** `app/layout.tsx` (o equivalente principal):
  - Envolver la app en el `<QueryProvider>`.
- **Crear** `lib/react-query/hooks/useDisciplines.ts`:
  - `useDisciplines` (GET), `useCreateDiscipline` (POST), `useUpdateDiscipline` (PATCH), `useDeleteDiscipline` (DELETE).
- **Crear** `lib/react-query/hooks/usePlans.ts`:
  - Equivalente para los Planes.
- **Modificar** `app/admin/configuraciones/page.tsx` (y sus componentes hijos):
  - Consumir los hooks recién creados en vez de usar `useBlackSheepStore`.
- **Modificar** `lib/blacksheep-store.ts`:
  - Borrar el estado, actions y loaders referidos a `disciplines` y `plans` (ej. `fetchDisciplines`, `createDiscipline`, etc.).

#### 2. Criterio de Validación
- El panel de `admin/configuraciones` carga la lista de planes y disciplinas sin lag.
- Creación, edición y eliminación de una disciplina/plan impacta inmediatamente la UI (mediante `queryClient.invalidateQueries`).
- El Network tab no debe mostrar requests redundantes gracias a TanStack.
- En la UI, el indicador de fetching del devtools o de React Query funciona.

#### 3. Grep de Seguridad
Asegurarnos de que no existan consumidores residuales del store viejo para estas entidades:
```bash
grep -rn "fetchDisciplines\|createDiscipline\|updateDiscipline\|deleteDiscipline\|fetchPlans\|createPlan\|updatePlan\|deletePlan" \
  app/ components/ lib/ \
  --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules"
```
*Esperado: Ninguna referencia fuera de los archivos que ya hemos eliminado. Todo llamado debe provenir de los nuevos hooks de React Query.*
