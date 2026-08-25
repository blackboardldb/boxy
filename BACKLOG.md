# Backlog y Deuda Técnica (Boxy)

Este documento registra los hallazgos, decisiones pospuestas y deuda técnica identificada durante las sesiones de auditoría y desarrollo. **Ningún ticket "no bloqueante" debe quedar solo en la memoria del chat.**

## Pendientes de Infraestructura y BD
- [ ] **`@@schema("auth")` en Prisma:** Implementar Opción B para evitar que migraciones futuras interfieran con las tablas manejadas por Supabase.
- [ ] **`DROP COLUMN saasPlanName`:** La columna ya fue desenchufada de la lógica en TypeScript (se usa `saasPlanLimit` y `plan.name`). Ejecutar el borrado físico con una migración de Prisma **solo después de confirmar estabilidad en producción**.

## Seguridad y Arquitectura
- [ ] **Rate-limit en flujos de autenticación:** Falta implementar limitación de peticiones (rate-limit) en `change-password` y proteger el keyspace de las contraseñas por defecto contra ataques de fuerza bruta.
- [ ] **Excepción amplia en Proxy (`proxy.ts`):** El bypass `pathname.startsWith("/manager/api/cron/")` es demasiado amplio. Si se agregan nuevos crons en el futuro, quedarán expuestos por defecto si no validan su propio secreto. Acotar o rediseñar la estrategia de bypass.

## Producto / UX
- [ ] **`customSplashUrl`:** Pendiente de definición de producto sobre cómo se va a comportar la pantalla de carga (splash screen) en la PWA y si se habilitará por tenant.
