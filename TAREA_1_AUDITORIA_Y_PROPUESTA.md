# 🧩 Tarea 1: Auditoría y Propuesta de Optimización de APIs

Este documento detalla el estado actual del consumo de datos en BlackSheep Board, identifica ineficiencias críticas y propone un plan de optimización enfocado en la simplicidad y el uso real de la aplicación.

---

## 1. Auditoría del Estado Actual

### 🏢 `/api/organization`
- **Tamaño Estimado**: 10-15 KB.
- **Relaciones**: Ninguna (`findUnique` directo).
- **Problema de Redundancia**: El objeto `settings` (JSONB) contiene una copia de `description` y `branding` que ya se envían en la raíz del objeto mapeado.
- **Uso en UI**: Se usa en `Nav` y `Layout` para el nombre del centro y colores de marca.

### 👤 `/api/me`
- **Tamaño Estimado**: 10-50 KB (variable según el historial).
- **Problemas Detectados**:
  - **Historial Pesado**: El campo `membership.history` crece cada mes. En el dashboard diario (mount), esta información no se consulta, pero se descarga siempre.
  - **Over-fetching Admin**: Envía campos como `address`, `emergencyContact` y `notes` en cada carga, los cuales solo deberían estar en la vista de edición de perfil.
- **Uso en UI**: Dashboards (`/app` y `/admin`) para mostrar el nombre del usuario y validar el estado de su plan.

### 🗓️ `/api/classes` (Listados y Calendario)
- **Tamaño Estimado**: 50-250 KB por respuesta de calendario semanal.
- **Problemas Detectados**:
  - **Redundancia de Entidades**: Incluye objetos completos de `instructor` y `discipline` en cada clase. El frontend ya dispone de un store centralizado de estas entidades (`fetchInstructors`, `fetchDisciplines`).
  - **Manejo de Participantes**: Envía el array `registeredParticipantsIds` completo (strings de ID) para todas las clases del listado. Esto genera un payload denso e ineficiente para el escalado.
  - **Lógica en el Cliente**: El frontend calcula `isUserRegistered` buscando iterativamente su propio ID en listas de terceros recibidas del servidor.

---

## 2. Estrategia de Optimización Propuesta

### A. Organización: Limpieza Inteligente
- **Estrategia**: Usar `select` en Prisma para filtrar los campos raíz.
- **Payload Final**: `id, name, branding, settings`.
- **Ajuste**: NO eliminar `settings` completamente; mantener un **select parcial** sobre `settings` para conservar campos operativos (`timezone`, `operatingHours`, `defaultCancellationHours`).

### B. Perfil: Exclusión del Historial
- **Estrategia**: Modificar el Service para que, por defecto, excluya `membership.history` de la respuesta del perfil.
- **Nueva Ruta**: Crear `/api/me/history` (bajo demanda) para la vista específica de historial de pagos/planes.
- **Select en Usuario**: Excluir campos de contacto administrativo del fetch inicial del Dashboard.

### C. Clases: Modelo de "Lista vs Detalle"
Para cumplir con la **Regla de Producto** (Listados = Conteo, Detalle = Lista), se proponen los siguientes ajustes:

1. **Eliminar Relaciones Pesadas**: Sustituir objetos `instructor` y `discipline` por sus respectivos IDs. El frontend vinculará los nombres usando su store local ya cargado.
2. **Backend-Calculated Flags**: El servidor devolverá un booleano `isUserRegistered` basado en el `userId` de la sesión activa. Esto elimina la necesidad de enviar IDs de otros alumnos en el listado.
3. **Uso de `_count`**: El array `registeredParticipantsIds` será sustituido por el conteo numérico (`_count: { registrations: true }`).

### D. Drawer Administrativo (UX)
- **Carga Bajo Demanda**: El `AdminClassDetailDrawer` se abrirá instantáneamente al seleccionar una clase (usando los datos básicos del listado).
- **Async Fetch**: Al abrirse, el drawer disparará un fetch independiente a `/api/classes/[id]/registrations` para obtener la lista nominal de participantes.
- **Skeleton UI**: Se mostrará un Skeleton en la sección de participantes mientras la info carga de forma asíncrona.

---

## 3. Impacto y Riesgos

### 🚀 Impacto Esperado
- Reducción del **~70%** en el tamaño del payload de calendario semanal.
- Reducción del **~40%** en la carga inicial del perfil de socios antiguos.
- Mayor claridad en el modelo de datos distribuido al frontend.

### ⚠️ Riesgos Identificados
- **Dependencia de Store**: Se asume que el frontend siempre carga instructores/disciplinas antes que las clases (comportamiento actual verificado en `CalendarPage`).
- **Cambio en Tipos**: El `blacksheep-store.ts` deberá actualizarse para manejar el nuevo campo de conteo en lugar de `.length`.

---

**Propuesta entregada para valoración final.**
