# Guía de Casos de Uso y Mejoras UX/UI - BlackSheep Platform

> [!IMPORTANT]
> Este documento es la **guía de referencia maestra**. Todos los nuevos casos documentados en `reporte_bugs_y_casos_de_uso.md` y `mejoras_ux_ui.md` deben seguir estrictamente los estándares aquí definidos.

Este sistema está diseñado para identificar, estructurar y resolver problemas de experiencia de usuario dentro de la plataforma, transformando ideas u observaciones en **decisiones de producto claras, accionables y evaluables**.

---

## Reglas de Documentación

Cada entrada en los documentos de seguimiento debe representar una **situación real de uso**, no solo una tarea o cambio visual aislado.

---

## 🧩 Estructura Obligatoria

Toda mejora o reporte debe seguir este formato exacto:

### 1. Estado
- 🔴 **Por Corregir**: Problema identificado y validado, aún sin solución implementada.
- 🟡 **Revisar**: Requiere definición adicional (funcional, técnica o de negocio).
- 🟢 **Editado**: Solución implementada y validada en uso real.

---

### 2. Contexto
Describe el entorno operativo donde ocurre la situación.

- **Ubicación**: (pantalla, flujo o módulo)
- **Ruta actual**: (ej: /admin/alumnos/[id])
- **Rutas relacionadas**: (opcional)
- **Situación**: (qué está haciendo el usuario específicamente)
- **Frecuencia**: Alta / Media / Baja
- **Relevancia**: Operativa / Experiencia / Negocio

---

### 3. Caso de Uso
Formato obligatorio:

> "Como **[tipo de usuario]**, quiero **[acción]**, para **[resultado esperado]**"

Debe ser específico, concreto y enfocado en un objetivo de usuario.

---

### 4. Problema
Describir qué ocurre actualmente y por qué es un problema real.

Debe responder:
- ¿Qué está pasando?
- ¿Por qué falla o genera fricción?
- ¿Qué error de interpretación o de datos genera?

*Evitar descripciones vagas como "es confuso" sin justificar el porqué técnico o de flujo.*

---

### 5. Impacto
Explicar la consecuencia real del problema si no se resuelve.

Puede incluir:
- Errores operativos (datos mal ingresados)
- Pérdida de tiempo (clics innecesarios)
- Mala experiencia (frustración del cliente)
- Riesgo de ingresos (renovaciones no cobradas)

---

### 6. Sugerencia
Propuesta clara y accionable que resuelva el problema.

Puede incluir:
- **UX (Interacción)**: Cambios en el flujo.
- **UI (Visual)**: Cambios en componentes o layout.
- **Lógica**: Reglas de negocio o automatizaciones.

#### Estructura de navegación propuesta (si aplica):
- **Ruta actual**:
- **Nuevas rutas**: (ej: separar crear de editar)

---

### 7. Criterios de Aceptación
Condiciones que deben cumplirse para dar la tarea por "Done".

Ejemplos:
- El usuario distingue claramente entre editar y crear.
- El sistema sugiere la fecha automáticamente sin intervención manual.
- No existen estados contradictorios en la pantalla.

---

### 8. Notas / Casos Límite (Opcional)
Escenarios especiales, excepciones o "edge cases" a considerar (ej: años bisiestos, precios en cero).

---

## 🖼️ Representación Visual (Wireframes ASCII)

Para cambios estructurales de UI, se recomienda incluir esquemas ASCII para:
- Validar la estructura antes de codificar.
- Detectar ambigüedades en la distribución de información.
- Alinear la lógica con el diseño.

*Regla: Son esquemas funcionales, no diseños finales de alta fidelidad.*

---

## 🧭 Principios de Navegación

Las rutas deben utilizarse como herramienta de diseño UX para separar responsabilidades:
- `/recurso/[id]` (Visualización/Lectura)
- `/recurso/[id]/editar` (Modificación de datos existentes)
- `/recurso/nuevo` (Creación pura)

---

## ⚠️ Principios Clave de Diseño
1. No documentar soluciones sin un problema claro.
2. Priorizar **claridad operativa** sobre estética.
3. Cada caso debe ser independiente y auto-explicativo.
4. Separar acciones críticas cuando generen ambigüedad.

---

## 🤖 Uso con IA

Al trabajar con este sistema mediante IA:
1. Volcar ideas o feedback crudo.
2. Pedir a la IA que identifique el contexto y el problema raíz.
3. Solicitar la traducción al formato de esta guía.
4. Validar el impacto y la sugerencia antes de proceder a la implementación.
