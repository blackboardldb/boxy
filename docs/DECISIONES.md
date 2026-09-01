# Boxy — Decisiones de Arquitectura y Negocio

> Registro de decisiones deliberadas y su razón. No es un historial de bugs (ver CHANGELOG.md).

## Datos y modelo

| Decisión | Razón |
|---|---|
| Tenancy lógico (`organizationId`), sin RLS | RLS con `adapter-pg` requiere inyectar JWT claims por conexión — complejo en serverless. Toda la protección recae en capa aplicativa. |
| Snapshot inmutable para planes SaaS | Editar la plantilla no debe afectar retroactivamente a centros ya asignados. Mismo patrón usado para snapshots de `UserMembership`. |
| Pagos manuales, sin pasarela integrada | Decisión de negocio válida — Boxy opera como CRM/ERP de conciliación, no como procesador de pagos. |
| Precios en CLP ×100 (centavos) | Consistencia técnica con `OrganizationPayment.amount`, no porque CLP tenga subdivisión real en circulación. |

## Seguridad

| Decisión | Razón |
|---|---|
| Fail-closed por defecto en roles | Si una función recibe un rol opcional y no se pasa, asume el rol de menor privilegio (`SUPPORT`), no el de mayor. |
| PII enmascarada devuelve `null`, no string ofuscado | Separación de dato y presentación — la UI decide cómo mostrar ausencia de dato. |
| `organizationId` siempre del header del proxy, nunca del JWT ni del body | El JWT puede estar desfasado hasta 1h; el body lo controla el cliente. |
| Fallo ruidoso ante violación de reglas de negocio/seguridad | `throw Error` explícito en vez de degradación silenciosa — mismo criterio en todo el proyecto (ej. plan inexistente al crear organización). |

## Archivos y Branding

| Decisión | Razón |
|---|---|
| Solo PNG real (magic bytes), no por extensión/MIME declarado | El cliente no es fuente confiable del tipo de archivo. |
| Splash screen (`customSplashUrl`) descartado por ahora | Ver BACKLOG.md — un splash no tiene margen de "skeleton" como un ícono de header; mostrar el default en cada carga sería peor que no tener splash. |
| Escalado a 512px en cliente (Canvas), no en servidor | Evita agregar librerías de procesamiento de imágenes pesadas al backend; el re-rasterizado además sanitiza metadata oculta como bonus. |

## Convenciones de API

| Decisión | Razón |
|---|---|
| Endpoints de superadmin bajo `/manager/api/` | Namespace separado del resto de la app, con su propio guard (`requireManager`) y su propia tabla de usuarios (`manager_users`, independiente de `organization_members`). |
| Excepciones de proxy lo más restrictivas posible | Un bypass amplio (`startsWith`) sin control interno propio deja rutas futuras expuestas por accidente. |
| Cron protegido por `CRON_SECRET`, validado en el propio endpoint | El bypass del proxy no es la única barrera — el endpoint debe defenderse solo, sin asumir que el proxy lo protege. |
| `invalidateQueries(["me"])` sin scope de `organizationId` en `useClasses.ts` | Auditado y descartado como riesgo: no hay selector de tenant client-side, cambiar de centro siempre implica navegar a otro subdominio (hard reload), por lo que el `queryClient` nunca persiste entre tenants. Además `["me"]` no está parametrizado en ningún lado del codebase (`meKeys.me = ["me"]`) — invalidar `["me", activeOrgId]` sería un no-op silencioso porque no matchea la key real cacheada. Cambiarlo habría roto la UI de cupos (`centerStats`) sin resolver ningún problema real. |

## Explícitamente descartado

| Qué | Por qué |
|---|---|
| Realtime (Supabase) | Inerte por RLS sin policies, sin valor percibido sobre "refetch al reenfocar". Eliminado del código, no solo desactivado. |
| `customSplashUrl` | iOS no usa el manifest para splash (requiere `apple-touch-startup-image` por cada resolución de dispositivo, no una sola imagen como el logo). Alcance real mayor al estimado inicialmente para un feature de baja frecuencia de uso en B2B. Si se reconsidera, evaluar desde cero — no reutilizar el patrón de `customIconUrl`. |
| `.partial()` heredado entre schemas Zod de create/update | Un campo agregado a `create` para otro propósito quedaría automáticamente editable vía `update` sin que nadie lo decida — se usa lista blanca explícita en su lugar. |
| Strings ofuscados para enmascarar PII | Ver tabla de Seguridad arriba. |
