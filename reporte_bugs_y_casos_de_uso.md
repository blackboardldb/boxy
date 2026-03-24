# Reporte de Bugs y Casos de Uso - BlackSheep Platform

Este documento centraliza los problemas detectados en la experiencia de usuario (UX) y la lógica de negocio durante las pruebas del sistema.

## 📋 Resumen de Estados
- 🔴 **Por Corregir**: Problema identificado pendiente de solución.
- 🟡 **Revisar**: Requiere más investigación técnica o definición de producto.
- 🟢 **Editado**: El problema ha sido corregido y verificado.

---

## 1. Visibilidad de Clases Reservadas al Límite del Plan
**Estado:** 🔴 Por Corregir

**Caso de Usuario:**
"Como **Alumno**, una vez que he reservado todas las clases de mi plan (ej: 10/10), quiero poder seguir viendo mis clases en el calendario para gestionarlas (cancelarlas o cambiarlas), aunque el sistema me indique que ya no tengo más cupos disponibles para nuevas reservas."

**Problema:**
- El sistema muestra correctamente "Sin clases disponibles" en el Home, pero el Calendario deja de mostrar las horas ya inscritas.
- Esto quita flexibilidad al alumno para liberar un cupo y cambiar de horario.

**Sugerencia:**
- Mostrar un mensaje tipo: "Has ocupado todas tus clases (10/10)".
- Asegurar que el componente de próximas clases en la raíz de `/app` y el calendario sigan consumiendo y mostrando las reservas activas.

---

## 2. Sincronización de Contadores (Home y Profile)
**Estado:** 🔴 Por Corregir

**Caso de Usuario:**
"Como **Alumno**, quiero que al momento de reservar una clase, mi contador de clases consumidas/restantes se actualice inmediatamente en todas las pantallas simultáneamente."

**Problema:**
- En la página inicial de `/app` el contador (ej: 10/10) no cambia al reservar.
- En `/app/profile` la información también está desactualizada.
- La lógica actual no descuenta los "créditos" de forma reactiva en el frontend.

---

## 3. Discrepancia de Datos: Dashboard vs. Finanzas
**Estado:** 🟡 Revisar

**Caso de Usuario:**
"Como **Administrador**, quiero que los reportes de miembros reflejen con claridad la diferencia entre 'usuarios entrenando actualmente' y 'usuarios que pagaron este mes'."

**Problema:**
- `/admin` muestra 36 miembros activos (todos los que tienen membresía vigente hoy).
- `/admin/finanzas` muestra 24 membresías (solo los que iniciaron/renovaron periodo este mes).
- El sistema calcula el ingreso mensual recurrente (MRR) teórico en uno y el flujo de caja real en otro, lo que causa confusión si no se etiqueta correctamente.

---

## 4. Flujo de Renovación de Membresía
**Estado:** 🔴 Por Corregir

**Caso de Usuario:**
"Como **Alumno**, quiero solicitar la renovación de mi plan y que el **Administrador** pueda aprobarla, viendo y editando la fecha de inicio del nuevo ciclo."

**Problema:**
- La solicitud en `/app` usa datos mock y no llega a la sección de notificaciones del admin.
- Las notificaciones de admin no permiten editar la fecha de inicio del plan (importante si el alumno paga después de su fecha de corte).
- El panel editar usuario  es "engorroso" para agregar nuevos planes, ya que muestra en input el plan actual y cuesta saber cuando estoy editando el plan actual o uno nuevo. Se sugiere evaluar una página nueva en lugar de un modal.


## 6. Viabilidad de Estadísticas en Perfil
**Estado:** 🟡 Revisar

**Caso de Usuario:**
"Como **Alumno**, quiero ver mis estadísticas de entrenamiento en mi perfil para medir mi progreso."

**Problema:**
- Existe un modal de estadísticas en `/app/profile` pero su viabilidad técnica con la data real actual es incierta.
- **Acción:** Revisar qué data tenemos disponible en el backend para alimentar este gráfico o si debe simplificarse.
