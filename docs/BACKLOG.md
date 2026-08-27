# Backlog y Deuda Técnica (Boxy)
*Última actualización: 24 de agosto de 2026*

Este documento registra los hallazgos, decisiones pospuestas y deuda técnica identificada durante las sesiones de auditoría y desarrollo. **Ningún ticket "no bloqueante" debe quedar solo en la memoria del chat.**

Cada ítem debe mantener el contexto necesario para retomarlo sin tener que reconstruir la discusión original:
**Qué falta → Por qué importa → Qué NO hacer (decisiones descartadas).**

## Pendientes de Infraestructura y BD

- [x] ~~**`@@schema("auth")` en Prisma — modelos removidos de schema.prisma**~~
  - **Resolución (26 ago 2026):** `schemas = ["public"]`, `multiSchema` removido, 
    22 modelos/9 enums de `auth` borrados de `schema.prisma`. Verificado con 
    `prisma validate` y `tsc --noEmit` limpios.
  - **Qué NO se hizo (a propósito):** No se editó `0_init/migration.sql` pese a 
    contener DDL de `auth`. Editarlo requiere `migrate resolve --applied 0_init` 
    coordinado exactamente contra producción, sin poder ensayarlo en staging 
    primero. Se prefirió mitigar con prohibición documentada (ver ARCHITECTURE.md 
    §13) hasta que exista staging.

- [ ] **Crear base de datos de staging**
  - **Qué falta:** Segunda base de datos (mismo proyecto Supabase con un branch/instancia separada, o proyecto Supabase nuevo) desconectada de producción, para que desarrollo y pruebas dejen de correr directo contra datos reales.
  - **Por qué importa:**
    - *Beneficio directo:* permite usar `prisma migrate dev` y `migrate reset` con seguridad — hoy están efectivamente prohibidos en este proyecto (ver ARCHITECTURE.md §13) porque cualquier error local destruye datos reales de centros y alumnos.
    - *Beneficio secundario:* habilita resolver el riesgo residual dejado pendiente en el ítem de `@@schema("auth")` — el DDL histórico de `auth` en `0_init/migration.sql` solo se puede sanear con seguridad si hay un ambiente donde ensayar `migrate resolve` antes de tocar producción.
    - *Beneficio de proceso:* permite probar migraciones (como la de `saasPlanName` de hoy) antes de correrlas en producción, en vez de confiar solo en `information_schema` queries manuales cada vez.
  - **Riesgos de NO tenerlo (el estado actual):**
    - Cualquier comando destructivo de Prisma corrido por error (`migrate reset`, `migrate dev` sin querer) borra datos reales de gimnasios activos.
    - Cada cambio de schema requiere el ritual manual completo de `db-migrations.md` — más lento y más propenso a error humano que un flujo automatizado con staging.
    - No hay forma de probar un `DROP` u otra migración irreversible antes de ejecutarla en el dato real (como tuvimos que hacer hoy con `saasPlanName`, verificando a mano en vez de poder ensayar primero).
  - **Riesgos de crearlo ahora mismo (por qué se pospuso):**
    - Proyecto en fase de pruebas activa — mantener dos bases de datos sincronizadas (mismos seeds, mismas migraciones aplicadas en ambas, mismo estado de features en desarrollo) agrega fricción de proceso en cada merge, en un momento donde la velocidad de iteración importa más.
    - Con equipo pequeño, el overhead de "¿a qué ambiente estoy conectado ahora?" puede generar sus propios errores si no se automatiza bien desde el principio (ej. variable de entorno mal seteada apuntando a prod por accidente — el mismo tipo de error que estamos tratando de evitar).
  - **Consejos para cuando se implemente:**
    - Usar Supabase branching (si el plan lo soporta) en vez de un proyecto Supabase completamente nuevo — mismo proyecto, rama de BD aislada, más simple de mantener sincronizada con `schema.prisma`.
    - Variable de entorno con nombre que grite el ambiente (`DATABASE_URL_STAGING` vs `DATABASE_URL`, o prefijos claros) — el error más común en estos setups es confundir cuál `.env` está activo.
    - Una vez creado: primer uso debería ser precisamente sanear `0_init/migration.sql` (el ítem que quedó documentado como riesgo residual), probando el `migrate resolve` ahí antes de tocar producción.
    - No migrar todo el flujo de golpe — empezar solo con staging para migraciones de schema (el caso de uso más riesgoso hoy), no necesariamente replicar todo el pipeline de CI/CD desde el día uno.
  - **Qué NO hacer:** No crear staging apurado solo para "tener la casilla marcada" — si la sincronización entre ambientes no se diseña bien desde el principio, genera más fricción y falsos positivos ("funcionó en staging pero no en prod" por drift entre ambas) que el problema que resuelve.

- [ ] **`DROP COLUMN saasPlanName`**
  - **Qué falta:** Ejecutar el borrado físico de la columna en la BD con una migración documentada de Prisma.
  - **Por qué importa:** La columna ya fue desenchufada de TypeScript para erradicar la doble fuente de verdad (ahora se usa el snapshot validado `saasPlanLimit` y la relación `plan.name`). Mantenerla viva indefinidamente genera confusión semántica en la DB.
  - **Qué NO hacer:** No borrar la columna en el mismo sprint en el que se limpia el código. Esperar a confirmar la estabilidad absoluta en producción (0 referencias rotas) antes de lanzar el drop irreversible.

## Seguridad y Arquitectura

- [x] ~~**Rate-limit en `change-password`**~~
  - ~~**Qué falta:** Proteger el endpoint `me/change-password` de fuerza bruta: hoy llama a `signInWithPassword` sin ningún límite de reintentos.~~
  - ~~**Qué importa:** El endpoint `change-password` pasó a depender internamente de `signInWithPassword` (para validar credenciales antes de re-autenticar o cambiar estado). Esto lo convirtió en un nuevo vector potencial de fuerza bruta que antes no existía con esa misma severidad.~~
  - ~~**Qué NO hacer:** No implementar un bloqueo de IP estricto sin considerar que muchos gimnasios/centros operan bajo una misma IP pública (NAT); preferir account lockout o rate-limit por tenant/usuario.~~
  - **Resolución (26 de agosto de 2026):** Rate-limit via conteo de `SystemEvent` de tipo `password_change_failed` por `(organizationId, userId)` — 5 fallos en 15 min = 429. Sin infra nueva. Fail-closed si `dbUserId` es null.

- [x] ~~**Excepción amplia en Proxy (`proxy.ts`)**~~
  - ~~**Qué falta:** Acotar o rediseñar la estrategia de bypass del proxy para las rutas del cron.~~
  - ~~**Qué importa:** El bypass actual (`pathname.startsWith("/manager/api/cron/")`) excluye de toda protección de sesión a cualquier endpoint de cron, delegando la seguridad (ej: `CRON_SECRET`) al propio endpoint. Si a futuro un developer agrega `/manager/api/cron/reports` y olvida el candado manual, la ruta quedará expuesta silenciosamente al público.~~
  - ~~**Qué NO hacer:** No confiar en excepciones heredadas por prefijo si la ruta puede escalar. Tratarlo con el mismo rigor que las excepciones genéricas (`.partial()`) en Zod.~~
  - **Resolución (25 de agosto de 2026):** Se implementó una whitelist explícita (`CRON_ROUTES = new Set(["/manager/api/cron/billing"])`) en `proxy.ts`, y se robusteció la validación en el handler con `crypto.timingSafeEqual` y chequeo de existencia de la variable de entorno.

- [ ] **Erradicar uso de `DEFAULT_PASSWORD_*` de variables de entorno en creación de usuarios**
  - **Qué falta:** Modificar `createAuthUser` en `lib/supabase/admin.ts` y el endpoint `POST /api/users` para que utilicen la contraseña cifrada por tenant (`defaultStudentPassword`, etc. en la tabla `Organization`), erradicando la lectura global de `process.env.DEFAULT_PASSWORD_ALUMNO`.
  - **Por qué importa:** Actualmente, la creación de alumnos (y pronto el CSV) asigna la contraseña global heredada en lugar de la generada única para ese centro (tenant). Esto rompe la seguridad y el diseño de contraseñas por tenant.
  - **Qué NO hacer:** No hacer un fallback a las variables de entorno si la del tenant falta; fallar ruidosamente si un centro no tiene configurada su contraseña por defecto. No logear la contraseña desencriptada.
  - **Resolución (26 ago 2026):** Aplicado en 4 archivos productivos (`admin.ts`, `api/users/route.ts`, `api/instructors/route.ts`, `manager-service.ts`) + 2 scripts de seed con hardcode. Ver ticket de backfill abajo para `create-auth-for-existing-users.ts`.

- [ ] **Refactorizar `scripts/create-auth-for-existing-users.ts` para usar contraseña por tenant**
  - **Qué falta:** El script lee `DEFAULT_PASSWORD_ALUMNO` de env vars (contraseña global) para crear usuarios en Auth. Debe cambiarse para leer `Organization.defaultStudentPassword` del primer `OrganizationMember` del usuario y desencriptarla. Diseño aprobado:
    1. Añadir `include: { memberships: { take: 1, select: { organizationId: true } } }` al `findMany` de usuarios.
    2. Por cada usuario nuevo a crear: consultar `prisma.organization.findUnique` → `decryptPassword` → pasar a `supabase.auth.admin.createUser`.
    3. Si `memberships` está vacío: log `"SKIP — sin centro asignado, no se puede determinar la contraseña"` y continuar.
    4. Si `defaultStudentPassword` es null en ese centro: idem, log y skip ruidoso.
    5. Si el usuario pertenece a más de 1 centro: log explícito `"Usando password de organización X (de N encontradas) para <email> — verificar manualmente si el usuario pertenece a otro centro"` y usar el primero (`memberships[0]`).
  - **Por qué importa:** El script es de backfill (puede tocar usuarios reales), así que aplicarle un hardcode reproduce exactamente el bug que estamos cerrando, solo que en otro archivo.
  - **Qué NO hacer:** No poner ningún fallback ni hardcode si no se puede resolver la contraseña del tenant. No logear el texto plano de la contraseña.

- [ ] **Bug: `create-auth-for-existing-users.ts` filtra por `authId: ""` en vez de `authId: null`**
  - **Qué falta:** La query de Prisma en línea 68 usa `where: { authId: "" }`, pero el campo `authId` es `String` no-nullable en el schema — los usuarios sin Auth real probablemente tienen `authId: null` o un UUID inválido, no un string vacío. Verificar con una query directa si hay usuarios con `authId: ""` en producción y corregir el filtro al valor real que usa el sistema.
  - **Por qué importa:** Si el filtro no captura a los usuarios que realmente necesitan backfill, el script corre pero no hace nada — silencioso y peligroso.
  - **Qué NO hacer:** No asumir que el sistema nunca guarda `authId: ""` sin verificar antes con una query directa.
