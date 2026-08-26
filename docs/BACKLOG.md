# Backlog y Deuda Técnica (Boxy)
*Última actualización: 24 de agosto de 2026*

Este documento registra los hallazgos, decisiones pospuestas y deuda técnica identificada durante las sesiones de auditoría y desarrollo. **Ningún ticket "no bloqueante" debe quedar solo en la memoria del chat.**

Cada ítem debe mantener el contexto necesario para retomarlo sin tener que reconstruir la discusión original:
**Qué falta → Por qué importa → Qué NO hacer (decisiones descartadas).**

## Pendientes de Infraestructura y BD

- [ ] **`@@schema("auth")` en Prisma**
  - **Qué falta:** Implementar la "Opción B" (renombrar los modelos o ignorarlos en Prisma Client).
  - **Por qué importa:** Actualmente, Prisma intenta manejar modelos que le pertenecen a Supabase Auth. Un `migrate reset` o `migrate dev` futuro podría destruir o alterar la configuración del tenant sin darnos cuenta.
  - **Qué NO hacer:** No intentar usar la Opción A (`schemas = ["public"]`) con el preview feature `multiSchema`; Prisma exige estrictamente que todos los esquemas usados en las relaciones estén explícitamente declarados en el datasource, por lo que parcializar falla en validación.

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

## Producto / UX

- [ ] **`customSplashUrl` — pospuesto por diseño, no implementado**
  - **Qué falta:** Definir y (si corresponde) construir la subida de imagen de splash y el endpoint de configuración.
  - **Por qué importa:** Quedó como parte del modelo de datos (`Organization`) pero nunca se hizo interfaz. Antes de implementarlo, hay que validar en un dispositivo real cómo Chrome/Safari cachean el splash de una PWA instalada (suele fijarse en el manifest y no recargarse en cada apertura, lo cual podría resolver el problema de timing de raíz).
  - **Qué NO hacer:** No replicar la estrategia que usamos para el logo (`customIconUrl`). Un splash screen no tiene el mismo margen para manejar el timing de carga (no se puede mostrar un "skeleton" en un splash, y revertir al default en cada recarga si el custom no cargó a tiempo sería peor que no tener splash). Se descartó por esto mismo.
