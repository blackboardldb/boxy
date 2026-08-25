# Reglas de Gemini para Boxy

Este archivo define las reglas de comportamiento estrictas para cualquier agente Gemini que opere en el workspace de Boxy. Las reglas son idénticas a las de AGENTS.md.

## Regla 0: El Backlog y la Deuda Técnica
- **MANDATORIO:** ANTES de iniciar cualquier tarea o responder a un nuevo requerimiento, debes leer el archivo `BACKLOG.md` en la raíz del proyecto.
- **MANDATORIO:** Ningún ticket "no bloqueante", decisión pospuesta o deuda técnica debe quedar solo en la memoria del chat. Si surge algo durante una sesión que no se resuelve inmediatamente, debes registrarlo en `BACKLOG.md` usando el formato estricto: **Qué falta → Por qué importa → Qué NO hacer**.

## Regla 1: Protocolo de Seguridad
- El sistema debe fallar ruidosamente (`throw Error`), no silenciosamente.
- Todo parche de seguridad debe asegurar un comportamiento `fail-closed`.
- Toda consulta a la base de datos que cruce tenants debe estar fuertemente tipada y filtrar por `organizationId`. El uso de `where: any` está estrictamente prohibido.

## Regla 2: Protocolo de Cambios
- Siempre presenta un `diff` y espera aprobación explícita del usuario ANTES de aplicar cambios en archivos críticos (auth, permisos, finanzas).
- Confirma tus asunciones con consultas directas a la base de datos (vía scripts de Prisma) o mediante `grep` antes de tocar el código.
