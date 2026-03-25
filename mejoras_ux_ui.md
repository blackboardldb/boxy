

# 1. Rediseño de Vista Detalle de Alumno (`/admin/alumnos/[id]`)

### Estado
🔴 Por Corregir

---

### Contexto
- **Ubicación**: Vista de detalle de alumno en panel administrativo
- **Ruta actual**: /admin/alumnos/[id]
- **Situación**: El administrador gestiona datos personales, membresía y renovaciones mientras atiende o administra alumnos
- **Frecuencia**: Alta (uso diario)
- **Relevancia**: Operativa + Negocio

---

### Caso de uso
"Como administrador, quiero gestionar la información personal y los ciclos de membresía de un alumno de forma clara, diferenciando explícitamente entre editar el plan actual y crear uno nuevo, para evitar errores operativos y tener visibilidad completa del historial en una sola vista."

---

### Problema
- La vista mezcla edición de perfil con edición de membresía sin separación clara.
- No existe distinción explícita entre editar un plan existente y crear uno nuevo.
- El formulario presenta datos del plan actual en inputs, generando ambigüedad sobre si se está modificando o creando.
- No hay diferenciación clara entre modo lectura y edición.
- El flujo de renovación no sugiere automáticamente una fecha lógica basada en el plan anterior.
- El uso de pestañas fragmenta la información crítica (historial, asistencia, planes).
- El contador de clases no refleja correctamente el consumo real.

---

### Impacto
- Alto riesgo de errores en la configuración de planes
- Pérdida de tiempo en tareas operativas repetitivas
- Confusión en el flujo de renovación
- Posible impacto en ingresos por mala gestión de planes
- Mala experiencia en uso diario del sistema

---

### Sugerencia
- Reestructurar la vista en dos zonas:
  - Izquierda: acciones (edición)
  - Derecha: contexto e historial

- Implementar edición inline (lectura → edición) para:
  - datos personales
  - plan actual

- Separar claramente:
  - "Editar plan actual"
  - "Agregar nuevo plan"

- Automatizar:
  - fecha de término según duración
  - sugerencia de fecha de inicio basada en plan anterior

- Permitir flexibilidad controlada:
  - edición manual de fechas
  - ajuste de clases
  - modificación de precio

- Unificar historial en una sola línea temporal:
  - clases pasadas y futuras
  - estados claros (asistió / no asistió / reservado)

- Eliminar tabs y usar estructura continua o acordeones

#### Estructura de navegación propuesta:
- **Ruta actual**:
  - /admin/alumnos/[id] → vista principal (lectura + edición controlada)

- **Nuevas rutas**:
  - /admin/alumnos/[id]/nuevo-plan → creación de plan
  - /admin/alumnos/[id]/editar-plan → edición explícita del plan actual (evaluar inline vs ruta)

---

### Criterios de aceptación
- El usuario distingue claramente entre editar y crear un plan
- El plan actual no se presenta como formulario editable por defecto
- La fecha de inicio sugerida se calcula automáticamente
- El historial es visible sin cambiar de pestaña
- El contador de clases refleja correctamente los datos reales
- La edición no genera ambigüedad ni errores de interpretación

---

### Notas / Casos límite
- Plan con precio 0
- Extensiones manuales de membresía
- Renovaciones antes del término del plan actual
- Casos sin imputación contable

---
