# Backlog y Deuda Técnica (Boxy)
*Última actualización: 07 de septiembre de 2026*

Este documento registra los hallazgos, decisiones pospuestas y deuda técnica identificada durante las sesiones de auditoría y desarrollo. **Ningún ticket "no bloqueante" debe quedar solo en la memoria del chat.**

Cada ítem debe mantener el contexto necesario para retomarlo sin tener que reconstruir la discusión original:
**Qué falta → Por qué importa → Qué NO hacer (decisiones descartadas).**

## Pendientes de Correctitud y Finanzas

- [x] ~~**Bug crítico: `calculateBillingPeriodEnd` usa horario UTC crudo y tiene un off-by-one en el día exacto del ciclo**~~
  - ~~**Qué falta:** `calculateBillingPeriodEnd` (`lib/services/manager-service.ts`) usa `new Date()`, `d.getDate()` y `d.setHours(23,59,59,999)` sin convertir a horario de Chile. El cron de suspensión (`app/manager/api/cron/billing/route.ts`) compara contra `new Date()` crudo también. Esto suspende centros en horario prime (20:00-21:00 hrs Chile) en vez de a medianoche, y además puede dar o quitar un mes completo de margen dependiendo de si el pago cae antes o después de las 20-21hrs Chile del día límite.~~
  - ~~**Por qué importa:** Corta el acceso de un negocio real en pleno horario de clases vespertinas — el peor momento posible para un gimnasio. Puede además otorgar un mes gratis o cero días de gracia dependiendo de la hora exacta del pago, de forma no determinista para el usuario.~~
  - ~~**Qué NO hacer:** No usar `getMonth()`/`getDate()`/`getHours()` nativos ni asumir que "restar horas" alcanza — ya se corrigió un bug idéntico en `finance-compare`/`stats` (ver entrada de agosto) usando `toZonedTime(..., "America/Santiago")` primero y **luego** los getters UTC sobre el resultado zonificado. Aplicar el mismo patrón acá, no reinventar la conversión.~~

- [x] ~~**Fix preventivo: desfase de zona horaria en `ClassSession.dateTime` — calendar, registro y validación de cupos**~~
  - ~~**Qué faltaba:** Tres archivos usaban `toISOString().split("T")[0]` para extraer el "día" de un instante real de clase, lo que devuelve el día en UTC, no en Chile. Una clase a las 21:30 del lunes en Chile es 00:30 UTC del martes — el código los confundía.~~
  - ~~**Por qué importaba:** Clases programadas entre las 21:00 y 23:59 Chile habrían sido: (1) invisibles en el calendario del alumno, (2) contabilizadas en el cupo del día *siguiente*, (3) bloqueadas por el advisory lock del día incorrecto.~~
  - ~~**Por qué no se detectó antes:** Ningún gimnasio había programado clases en esa franja (confirmado: 0 de 160 sesiones en BD). El bug era preventivo, no un incendio activo. "Sin quejas" no significaba "sin bug".~~
  - ~~**Archivos corregidos:** `lib/services/class-service.ts`, `app/api/users/[id]/classes/route.ts`, `lib/validation-service.ts`.~~
  - ~~**Qué NO hacer:** No extender este mismo fix a `RoutineAssignment.assignedDate` (tipo `@db.Date`, Prisma lo coerciona a medianoche UTC) ni a `UserMembership.(currentPeriodStart/End)` (proxy de strings `YYYY-MM-DD`, el fix rompería la normalización). Ver §9 de `ARCHITECTURE.md` para la distinción completa.~~

- [x] ~~**Comportamiento del Cron de facturación: `TRIAL` centers con `billingPeriodEnd: NULL`**~~
  - ~~**Decisión de Negocio (07-Sep):** "NO LO VAMOS A USAR EN PRODUCCIÓN". No se requiere acción. El cron ignora silenciosamente estos registros.~~

- [x] ~~**Campos de ubicación en el frontend del Manager**~~
  - ~~**Qué falta:** Agregar los inputs de formulario para `country`, `region` y `city` en las vistas de creación (`app/manager/(dashboard)/centros/nuevo/page.tsx`) y edición (`app/manager/(dashboard)/centros/components/edit-center-form.tsx`) de centros.~~
  - ~~**Por qué importa:** El backend (`manager-service.ts`) y la base de datos (Prisma) ya soportan completamente estos campos, pero actualmente no se pueden modificar visualmente desde el panel del superadmin.~~
  - ~~**Qué NO hacer:** No crear componentes complejos de select dependientes (ej. si elige región X, mostrar ciudades de X) todavía — empezar con simples inputs de texto para destrabar la edición de datos básicos.~~

- [ ] **Soporte multi-moneda / Internacionalización (Pendiente a largo plazo)**
  - **Qué falta:** Desacoplar la lógica de moneda (actualmente hardcodeada a CLP x100) y el país por defecto ("Chile") a nivel global.
  - **Por qué importa:** Con la reciente inclusión de los campos geográficos a la organización, la plataforma técnica ya permite segmentar por país, pero los módulos de pagos, suscripciones e integraciones siguen asumiendo Chile.
  - **Qué NO hacer:** No agregar columnas de `currency` a cada tabla. Manejar una configuración global por tenant.

- [ ] **Crear base de datos de staging**
  - **Qué falta:** Segunda base de datos (mismo proyecto Supabase con un branch/instancia separada, o proyecto Supabase nuevo) desconectada de producción, para que desarrollo y pruebas dejen de correr directo contra datos reales.
  - **Por qué importa:**
    - *Beneficio directo:* permite usar `prisma migrate dev` y `migrate reset` con seguridad — hoy están efectivamente prohibidos en este proyecto (ver ARCHITECTURE.md §13) porque cualquier error local destruye datos reales de centros y alumnos.
    - *Beneficio secundario:* habilita resolver el riesgo residual dejado pendiente en el ítem de `@@schema("auth")` — el DDL histórico de `auth` en `0_init/migration.sql` solo se puede sanear con seguridad si hay un ambiente donde ensayar `migrate resolve` antes de tocar producción.
    - *Beneficio de proceso:* permite probar migraciones antes de correrlas en producción, en vez de confiar solo en `information_schema` queries manuales cada vez.
  - **Riesgos de NO tenerlo (el estado actual):**
    - Cualquier comando destructivo de Prisma corrido por error (`migrate reset`, `migrate dev` sin querer) borra datos reales de gimnasios activos.
    - Cada cambio de schema requiere el ritual manual completo de `db-migrations.md` — más lento y más propenso a error humano que un flujo automatizado con staging.
    - No hay forma de probar un `DROP` u otra migración irreversible antes de ejecutarla en el dato real.
  - **Riesgos de crearlo ahora mismo (por qué se pospuso):**
    - Proyecto en fase de pruebas activa — mantener dos bases de datos sincronizadas (mismos seeds, mismas migraciones aplicadas en ambas, mismo estado de features en desarrollo) agrega fricción de proceso en cada merge, en un momento donde la velocidad de iteración importa más.
    - Con equipo pequeño, el overhead de "¿a qué ambiente estoy conectado ahora?" puede generar sus propios errores si no se automatiza bien desde el principio.
  - **Consejos para cuando se implemente:**
    - Usar Supabase branching (si el plan lo soporta) en vez de un proyecto Supabase completamente nuevo.
    - Variable de entorno con nombre que grite el ambiente (`DATABASE_URL_STAGING` vs `DATABASE_URL`).
    - Una vez creado: primer uso debería ser precisamente sanear `0_init/migration.sql` (el ítem que quedó documentado como riesgo residual).
    - No migrar todo el flujo de golpe — empezar solo con staging para migraciones de schema.
  - **Qué NO hacer:** No crear staging apurado solo para "tener la casilla marcada" — si la sincronización entre ambientes no se diseña bien desde el principio, genera más fricción y falsos positivos que el problema que resuelve.

## Reglas de negocio para /hub en centros SUSPENDED
- [x] ~~**Definir qué puede hacer el admin en `/hub` cuando está suspendido**~~
  - ~~**Decisión de Negocio:** Solo vista lectura y descargar los CSVs de alumnos y finanzas. Ya implementado.~~

- [x] ~~**Restricciones de operación en estado SUSPENDED**~~
  - ~~**Qué falta:** Definir y aplicar reglas de negocio para qué acciones quedan permitidas dentro de `/hub` cuando `Organization.status === "SUSPENDED"` (¿puede seguir creando alumnos? ¿puede seguir registrando pagos manuales/reservas mientras no paga la suscripción de Boxy?).~~
  - ~~**Qué NO hacer:** No bloquear todo `/hub` de forma ciega ni tampoco dejarlo 100% abierto sin ninguna restricción — hace falta decidir la lista de acciones restringidas antes de tocar código.~~
  - ~~**Resolución:** Ya implementado vía proxy (`d3862cf`). Se bloquearon las mutaciones (agregar alumnos, clases) pero se mantuvo lectura libre (dashboard, descargas CSV).~~

## Pendientes de Correctitud y Finanzas

- [x] ~~**Bug: `autoApprove` activa membresías futuras como `active` de inmediato (sin pasar por `scheduled`)**~~
  - ~~**Qué falta:** En `app/api/users/[id]/renewal/route.ts` (líneas 179 y 239), cuando el admin asigna un plan con `autoApprove: true` y `startDate` en el futuro, el sistema guarda `MembershipRenewal.status = "approved"` y `UserMembership.status = "active"` de forma inmediata. La corrección es comparar `startDateNormalized > new Date()` y asignar `"scheduled"` en ambos campos cuando la fecha aún no llegó.~~
  - ~~**Por qué importa:** El alumno queda con estado `"active"` en su membresía antes de que su período real comience. El mecanismo de promoción lazy en `user-service.ts` solo promociona desde `"scheduled"` → no detecta este limbo. Cualquier lógica basada en `UserMembership.status === "active"` (acceso a clases, conteos de alumnos activos, etc.) recibirá un falso positivo durante el período previo al inicio real del plan.~~
  - ~~**Qué NO hacer:** No cambiar el mecanismo de promoción lazy para que también acepte `"approved"` — eso rompe el invariante global. No arreglar solo el `MembershipRenewal` sin corregir también el `UserMembership` (o viceversa); los dos estados deben ser consistentes entre sí. Ver ARCHITECTURE.md §15 para el invariante completo y el snippet de corrección.~~

- [x] ~~**`today` en `finance-compare` y `stats` puede leer el mes incorrecto a fin de mes en Chile**~~
  - ~~**Qué falta:** En `app/api/admin/finance-compare/route.ts` y `app/api/admin/stats/route.ts`, el "mes actual" se calcula con `today.getUTCFullYear()` y `today.getUTCMonth()`. A las 21:00-23:59 del último día del mes en Santiago, `today` en UTC ya es el día 1 del mes siguiente — los rangos de mes quedan desplazados.~~
  - ~~**Por qué importa:** Un admin que revisa el dashboard a esa hora verá datos del mes equivocado. En fin de mes puede ocultar o mostrar ingresos incorrectamente.~~
  - ~~**Fix correcto:** Se reemplazó el uso nativo de `Date` por `getCurrentChileTime()` (que usa `toZonedTime(new Date(), "America/Santiago")` internamente) y *crucialmente* se leen sus componentes usando `.getUTCFullYear()` y `.getUTCMonth()` (los getters UTC son mandatorios porque `toZonedTime` desplaza el timestamp UTC interno; los getters locales reintroducirían el bug según el TZ de la máquina).~~
  - ~~**Qué NO hacer:** No cambiar `getUTCMonth()` por `getMonth()` — en Vercel el servidor también corre en UTC, el problema sería idéntico. Hay que hacer la conversión explícita a `America/Santiago` primero.~~

- [x] ~~**¿Ya se revirtió el flag `--webpack` del `package.json` porque Turbopack solucionó el OOM?**~~
  - **Resolución:** No se revirtió ni se debe revertir por ahora.
  - **Evidencia Cruda:** En pruebas manuales, Turbopack consume muy poca RAM (200MB) pero se cuelga infinitamente al compilar ciertas rutas del servidor. Log de la falla:
    ```text
    [PROXY] Request: GET /api/tenant/bsfit
    GET /api/admin/renewals?status=pending 200 in 4.2s
    [PRISMA] CREATING NEW PRISMA CLIENT INSTANCE!
    [heap] rss=253MB heapUsed=219MB
    GET /api/tenant/bsfit 200 in 858ms (next.js: 48ms, proxy.ts: 3ms, application-code: 807ms)
    ^C
    ```
    *(El request del HTML principal a `/hub` quedó colgado eternamente hasta matar el proceso).*
  - **Por qué importa:** El flag `--webpack` (junto con `--max-old-space-size=4096`) es la mitigación activa para evitar el deadlock de Turbopack. El alto uso de RAM reportado localmente (2.6GB) y los logs múltiples de Prisma (`CREATING NEW PRISMA CLIENT INSTANCE!`) son el comportamiento normal esperado del compilador Webpack de Next.js aislando procesos.
  - **Qué NO hacer:** No forzar Turbopack ni borrar el límite de memoria bajo la falsa premisa de un "memory leak".


## Auditoría de Caché y Estado Local (PWA)

- [x] ~~**Bug UI Stale Data (PWA / Mobile)**~~
  - ~~**Qué falta:**~~
    - ~~Eliminar `refetchOnWindowFocus: false` del `provider.tsx` de React Query (idealmente pasarlo a `true` que es el default o dejarlo explícito).~~
    - ~~Limpiar los overrides de `refetchOnWindowFocus: false` en los hooks individuales (como en `useMe.ts`).~~
    - ~~Evaluar agregar un listener a nivel global en la App (ej. en el Provider) para el evento `visibilitychange` de la PWA que dispare `queryClient.invalidateQueries()` al salir del estado `hidden` (Safari iOS a veces no dispara el event listener estándar de window focus al volver desde background).~~
  - ~~**Por qué importa:** Boxy no tiene Supabase Realtime activo. La estrategia oficial de actualización de datos documentada se basa en "refetch-on-refocus", pero actualmente está deshabilitada en código, dejando a las apps instaladas como PWA completamente estáticas tras volver del modo suspensión.~~
  - ~~**Qué NO hacer:** No reintroducir Supabase Realtime para arreglar esto (fue descartado deliberadamente). No alterar la configuración de Server-Side Cache, ya que actualmente todo corre por cliente y es seguro.~~

- [x] ~~**Bug Mutaciones Frontend que no invalidan caché**~~
  - ~~**Qué falta:** Refactorizar el uso directo de `fetchClient` (POST) en `app/alumnos/renovar-plan/page.tsx` para que utilice un hook `useMutation`. Ejecutar la invalidación de las query keys relevantes (ej. `meKeys.me`, `renewals`) en el callback de `onSuccess`.~~
    ~~*(Nota: Se realizó un barrido exhaustivo con `grep` sobre todo el directorio `app/` y `components/`. El único endpoint de mutación que no utiliza `useMutation` ni invalida caché es `renovar-plan/page.tsx`).*~~
  - ~~**Por qué importa:** Tras una renovación o mutación importante, los datos cacheados por React Query quedarán desactualizados en la memoria. Si el usuario navega a otra vista tras la mutación y el `staleTime` no ha expirado, verá los datos antiguos. Esto se agrava enormemente con el bug de PWA documentado arriba.~~
  - ~~**Qué NO hacer:** No re-inyectar `unstable_cache` en el servidor, todo se maneja desde el cliente. No forzar un `window.location.reload()` para saltear el problema; la solución en React/Next.js es invalidar el Query Client correctamente.~~
