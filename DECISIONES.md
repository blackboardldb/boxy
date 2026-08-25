# Decisiones de Arquitectura y Negocio (Boxy)

*Última actualización: 24 de agosto de 2026*

Este documento consolida las reglas activas que rigen cómo se construye y mantiene Boxy. Sustituye y consolida documentos históricos como `APP_MANAGER.md` y retrospectivas anteriores. Cualquier desarrollo futuro debe apegarse a estas convenciones.

## 1. Arquitectura de Datos y Estado

- **Snapshots Inmutables para Planes SaaS:** La lógica de negocio no debe recalcular límites basándose en nombres de planes. Se lee la columna `saasPlanLimit` (y similares) que funciona como un snapshot inmutable en la base de datos para cada centro. La relación `plan.name` se usa única y exclusivamente para propósitos de presentación en UI.
- **Unidades Monetarias:** Todos los valores monetarios (ej. CLP) se manejan internamente en su unidad base (centavos/enteros absolutos) para evitar errores de precisión flotante.

## 2. Protocolos de Seguridad y Aislamiento Multitenant (P0)

- **Aislamiento por Tenant Obligatorio:** Toda consulta a la base de datos (Prisma) que pueda cruzar información entre centros DEBE incluir explícitamente `organizationId` en su filtro `where`. 
- **Prohibición de `where: any`:** El uso de tipos `any` para construir filtros dinámicos de Prisma está estrictamente prohibido, ya que abre la puerta a vulnerabilidades IDOR. Los filtros deben construirse con objetos fuertemente tipados.
- **Enmascaramiento de PII por Rol (Fail-Closed):** Los datos sensibles (PII) de los centros (teléfonos, correos, RUT, nombres) solo se exponen al rol `OWNER`. Si una función recibe un rol, por defecto asume `SUPPORT` (comportamiento *fail-closed*) y enmascara los campos devolviendo `null`.
- **Fallo Ruidoso:** El sistema debe fallar ruidosamente (`throw Error`) ante cualquier violación de reglas de negocio o seguridad. No silenciar errores de autenticación o autorización.

## 3. Manejo de Archivos y Branding

- **Formatos Estrictos:** Para el branding (`customIconUrl`), se acepta única y exclusivamente formato PNG real.
- **Validación de Archivos:** Las subidas deben validarse comprobando los "magic bytes" (firma hexadecimal del archivo), limitando el tamaño máximo (ej. 2MB) y validando dimensiones de forma manual antes de subir a Storage. No confiar únicamente en el MIME type que envía el cliente.

## 4. Convenciones de API y Ruteo

- **Estructura Manager:** Todo endpoint exclusivo de administración de la plataforma vive bajo `/manager/api/`. 
- **Guards de Autenticación:** Se utiliza `requireManager()` (o equivalentes) que no solo valida la sesión, sino que extrae e inyecta el `role` y el contexto necesario para las consultas posteriores.
- **Crons y Bypass de Proxy:** Las excepciones en el proxy (ej. `/manager/api/cron/`) deben ser lo más restrictivas posible. Si una ruta se excluye de la validación de sesión, **debe** implementar su propio mecanismo de seguridad fuerte independiente (ej. validación contra `CRON_SECRET`).
