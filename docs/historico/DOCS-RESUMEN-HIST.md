# Bóveda de Documentación Histórica (Los Cimientos de 2025)
> **Zona:** `docs/historico/`
> **Era:** Julio 2025 - Febrero 2026

Este archivo es el museo de la plataforma BlackSheep. En esta carpeta se agruparon todos los diagramas y diseños que fungieron como "Big Bang" de la infraestructura. Es muy importante entenderlos porque contienen razones y filosofías de porqué el código tomó el camino que tomó antes del refactor del 2026.

---

## Los Grandes Archivos y Sus Lecciones Viejas

### `migration-guide.md` & `auth-flow-documentation.md`
**El Contexto:** La aplicación no tendría sistemas de logueo hechos en casa ni JWTs vulnerables. Se adoptó formalmente **Supabase Auth** como el custodio real y absoluto de las peticiones.
**El Error Perdonado:** En las versiones tempranas de esta doc (y del código), se forzaban comprobaciones de contraseñas de red en variables de entorno fijas (`blacksheep26`) en caso de no leer el servidor de correos. En Abril de 2026 esto fue exterminado bajo las normas HAL-12b por ser una falla potencial crítica (Contraseñas Hardcodeadas de Respaldo).

### `sistema-planes-membresia.md`
**El Contexto:** La concepción biológica del `fitCenterMembership`.
- En su época, modelar cuántas clases tomaba un chico (disciplinas permitidas, si tenía un mes congelado) usando 4 tablas cruzadas interrumpió el calendario de pases a producción y su complejidad abrumó a los desarrolladores Jr.
- Este archivo justificó y definió formalmente la regla táctica: *"Agruparemos esto en una propiedad de la tabla User de modo JSONB dinámico"*. 
- **La Lección Hoy:** La velocidad táctica fue exitosa. La deuda tecnológica generada para Marzo de 2026 fue una pesadilla imposible de indexar o migrar porque la información habitaba dentro de un bloque de texto amorfo en base de datos. Sirvió para despegar, pero fracasó a escala.

### `websocket-implementation-guide.md`
**El Contexto:** El "Corazón Vivo" de BlackSheep.
- Una agenda de boxeo/crossfit es sangrientamente competitiva. Si un bloque de la clase mostraba "1 Cupo Libre", y tres personas hacían click en React al mismo instante, alguien debía perder y todos los navegadores de los espectadores debían tachar ese bloque rojo al unísono de inmediato.
- Este documento forjó la arquitectura Socket.io / Supabase RealTime channel conectando micro-emisiones `classSession-registered` al instante en que el endpoint procesaba. Es el archivo que dotó de vida real a la plataforma.

### `sistema-finanzas-completo.md` & `sistema-finanzas.md`
**El Contexto:** Modelado de gastos y ganancias crudos.
- Definen la manera manual antigua de tratar de consolidar registros sueltos con membresías estáticas. Eventualmente superado por requerimientos tributarios masivos, sirvieron como plantilla a los posteriores updates en `app/dashboard/` y al nacimiento nativo del Dashboard Financiero de administrador como servicio auto contenido.

---

### Reflexión de Ingeniería sobre la Bóveda
Estos documentos ya no rigen estrictamente la capa del modelo de la base de datos (Prisma schema hoy difiere de ellos gracias a los proyectos HAL de evolución), pero sus flujos y sus procesos siguen definiendo la naturaleza del portal. Leerlos asegura al 100% que cualquier dev comprenda la regla de oro:
*La lógica de concurrencia y la validación de suscripciones es una obligación sagrada dentro del BlackSheep Gym Software.*
