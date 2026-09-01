# Backlog y Deuda Técnica (Boxy)
*Última actualización: 27 de agosto de 2026*

Este documento registra los hallazgos, decisiones pospuestas y deuda técnica identificada durante las sesiones de auditoría y desarrollo. **Ningún ticket "no bloqueante" debe quedar solo en la memoria del chat.**

Cada ítem debe mantener el contexto necesario para retomarlo sin tener que reconstruir la discusión original:
**Qué falta → Por qué importa → Qué NO hacer (decisiones descartadas).**

## Pendientes de Infraestructura y BD

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

## Pendientes de Correctitud y Finanzas

- [x] ~~**`today` en `finance-compare` y `stats` puede leer el mes incorrecto a fin de mes en Chile**~~
  - **Qué falta:** En `app/api/admin/finance-compare/route.ts` y `app/api/admin/stats/route.ts`, el "mes actual" se calcula con `today.getUTCFullYear()` y `today.getUTCMonth()`. A las 21:00-23:59 del último día del mes en Santiago, `today` en UTC ya es el día 1 del mes siguiente — los rangos de mes quedan desplazados.
  - **Por qué importa:** Un admin que revisa el dashboard a esa hora verá datos del mes equivocado. En fin de mes puede ocultar o mostrar ingresos incorrectamente.
  - **Fix correcto:** Se reemplazó el uso nativo de `Date` por `getCurrentChileTime()` (que usa `toZonedTime(new Date(), "America/Santiago")` internamente) y *crucialmente* se leen sus componentes usando `.getUTCFullYear()` y `.getUTCMonth()` (los getters UTC son mandatorios porque `toZonedTime` desplaza el timestamp UTC interno; los getters locales reintroducirían el bug según el TZ de la máquina).
  - **Qué NO hacer:** No cambiar `getUTCMonth()` por `getMonth()` — en Vercel el servidor también corre en UTC, el problema sería idéntico. Hay que hacer la conversión explícita a `America/Santiago` primero.


## Reglas de negocio para /hub en centros SUSPENDED
- **Qué falta:** Definir y aplicar reglas de negocio para qué acciones quedan permitidas dentro de `/hub` cuando `Organization.status === "SUSPENDED"` (¿puede seguir creando alumnos? ¿puede seguir registrando pagos manuales/reservas mientras no paga la suscripción de Boxy?).
- **Por qué importa:** Hoy "admin pasa" solo resuelve visibilidad (puede ver su dashboard y pagar), pero no restringe operación — un centro podría seguir operando con normalidad plena sin pagarle a Boxy, salvo por el banner.
- **Qué NO hacer:** No bloquear todo `/hub` de forma ciega (eso ya lo evita el fix actual) ni tampoco dejarlo 100% abierto sin ninguna restricción — ambos extremos son fáciles de implementar mal rápido; hace falta decidir la lista de acciones restringidas antes de tocar código.
