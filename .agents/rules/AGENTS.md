# Reglas de Agente para Boxy

## Regla 0 — Documentación obligatoria antes de trabajar

- **MANDATORIO:** antes de iniciar cualquier tarea, leer `ARCHITECTURE.md` (estado actual del sistema) y `BACKLOG.md` (deuda pendiente).
- **MANDATORIO:** ningún ticket "no bloqueante", decisión pospuesta o deuda técnica debe quedar solo en la memoria del chat. Registrar en `BACKLOG.md` con el formato: **Qué falta → Por qué importa → Qué NO hacer**.
- Si se cierra un ítem del backlog, tacharlo ahí — no dejarlo "implícitamente resuelto" sin actualizar el documento.

## Regla 1 — Protocolo de seguridad

- El sistema debe fallar ruidosamente (`throw Error`), no silenciosamente.
- Todo fix de seguridad debe ser fail-closed por defecto.
- Toda consulta a Prisma que cruce datos de tenant debe estar fuertemente tipada y filtrar por `organizationId`. `where: any` está prohibido.
- Ver `SECURITY.md` para los patrones prohibidos específicos y su origen.

## Regla 2 — Protocolo de cambios

- Presentar el diff completo y esperar aprobación explícita antes de aplicar cambios en archivos críticos (auth, permisos, finanzas, schema de base de datos).
- Confirmar asunciones con evidencia real (grep, query SQL directa, `tsc --noEmit`) antes de tocar código — nunca asumir el estado del código o la base de datos sin verificarlo.
- Un cambio "urgente" no exime de mostrar el diff — la urgencia justifica la prioridad, no saltarse la revisión.

## Regla 3 — Verificación post-cambio

- Ningún hallazgo se cierra solo con narración de que "se aplicó" — se cierra con evidencia cruda: resultado de `tsc --noEmit`, salida de una query, log de un test real.
- Si el cambio toca datos existentes (migración, backfill), correr una query de verificación después y pegar el resultado antes de continuar.
