# Aplicaciones BlackSheep CrossFit - Documentación Completa

## 📋 Índice

1. [Introducción](#introducción)
2. [Aplicación Cliente (`/app`)](#aplicación-cliente-app)
3. [Aplicación Admin (`/admin`)](#aplicación-admin-admin)
4. [Arquitectura y Conexiones](#arquitectura-y-conexiones)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Estados y Permisos](#estados-y-permisos)

---

## 🎯 Introducción

BlackSheep CrossFit cuenta con dos aplicaciones principales que trabajan de manera integrada para ofrecer una experiencia completa en el box de Los Ángeles:

- **🏃‍♂️ Aplicación Cliente (`/app`)**: Diseñada para que los miembros gestionen sus reservas y membresías de forma autónoma.
- **👨‍💼 Aplicación Admin (`/admin`)**: Herramienta de gestión centralizada para el staff y administradores.

Ambas aplicaciones comparten un backend robusto basado en **Next.js**, **Prisma** y **Supabase**, garantizando sincronización en tiempo real.

---

## 🏃‍♂️ Aplicación Cliente (`/app`)

### Propósito

Permitir a los alumnos del box gestionar su día a día: reservar clases, visualizar su plan actual y recibir notificaciones importantes.

### Estructura de Navegación

```
/app/
├── 🏠 Dashboard Principal (/)
├── 📅 Calendario de Clases (/calendario)
├── 👤 Perfil de Usuario (/perfil)
├── 💳 Gestión de Plan (/plan)
└── 📞 Soporte (/soporte)
```

### Secciones Detalladas

#### 🏠 Dashboard Principal (`/app`)

**Estados del Usuario (Dinámicos)**:

##### 🟢 Estado Activo
- ✅ Saludo: "¡Hola, [Nombre]! 👋"
- ✅ Resumen de Plan: "Plan Básico - Activo ✅"
- ✅ Contador de Clases: Visualización de asistencias (ej: "2/8 clases utilizadas").
- ✅ Próximas Reservas: Listado de clases inscritas.

##### 🟡 Estado Pendiente
- ⏳ Banner: "Plan Pendiente de Validación".
- 📱 Acciones: Botón de contacto directo por WhatsApp para agilizar la aprobación.
- ❌ Restricción: No puede reservar clases hasta ser validado por un admin.

##### 🔴 Estado Expirado
- 🚨 Banner: "Plan Expirado".
- 🔄 Acción: Acceso directo a la sección de renovación.
- ❌ Restricción: Bloqueo de nuevas inscripciones.

##### ❄️ Estado Congelado
- 🧊 Banner: "Plan Congelado".
- 📅 Información: Fecha de descongelación automática.
- ❌ Restricción: Suspensión temporal de reservas.

#### 📅 Calendario de Clases (`/app/calendario`)

**Disciplinas Disponibles**:
- **CrossFit**: Entrenamiento funcional de alta intensidad (Clases AM y PM).
- **Cross Balance**: Enfoque en equilibrio y movilidad.
- **Weightlifting**: Especialidad en levantamiento olímpico.
- **Pilates**: Sesiones de flexibilidad y core.

**Estados Visuales de Clases**:
- 🟢 **Disponible**: Botón "Inscribirse" activo.
- 🔵 **Inscrito**: Botón "Cancelar" disponible (según políticas de cancelación).
- 🔴 **Sin Cupos**: Indicador de clase llena.
- ⚪ **Finalizada/En Curso**: Clase pasada o actualmente ocurriendo.

---

## 👨‍💼 Aplicación Admin (`/admin`)

### Propósito

Control total sobre la operación del box: desde la validación de pagos hasta la configuración de la programación deportiva.

### Estructura de Navegación

```
/admin/
├── 📊 Dashboard (/)
├── 👥 Gestión de Alumnos (/alumnos)
├── 📅 Calendario Admin (/calendario)
├── 🏃‍♂️ Gestión de Clases (/clases)
├── 🎯 Disciplinas (/disciplinas)
├── 👨‍🏫 Instructores (/instructores)
├── 💳 Planes de Membresía (/planes)
├── 💰 Finanzas (/finanzas)
└── ⚙️ Configuración (/configuracion)
```

### Gestión de Planes y Membresías

**Planes Actuales**:
1. **Plan Full**: 24 clases/mes ($50.000).
2. **Plan Intermedio**: 15 clases/mes ($42.500).
3. **Plan Básico**: 10 clases/mes ($35.000).
4. **Variantes AM**: Precios reducidos para horarios de mañana.
5. **Planes Especiales**: Trimestral, Semestral, Anual e Ilimitado.
6. **Plan CrossBalance**: 8 clases específicas ($30.000).

---

## 🏗️ Arquitectura y Conexiones

### Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide React.
- **Componentes**: Shadcn/UI (Diseño premium y consistente).
- **Base de Datos**: PostgreSQL alojado en **Supabase**.
- **ORM**: **Prisma** para consultas tipadas y seguras.
- **Estado**: **Zustand** para persistencia local y manejo de estado global.

### Modelo de Datos (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  role      String   @default("user") // admin, instructor, user
  membership Json?    // Detalles del plan actual
  registrations ClassRegistration[]
}

model ClassSession {
  id           String   @id @default(cuid())
  disciplineId String
  status       String   @default("scheduled") // scheduled, cancelled, completed
  capacity     Int
}
```

---

## 🔐 Estados y Permisos

### Matriz de Acceso

| Acción | Cliente Activo | Pendiente | Expirado | Congelado | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Ver Calendario | ✅ | ✅ | ❌ | ❌ | ✅ |
| Reservar Clase | ✅ | ❌ | ❌ | ❌ | ✅ |
| Cancelar Reserva | ✅ | - | - | - | ✅ |
| Ver Finanzas Box | ❌ | ❌ | ❌ | ❌ | ✅ |
| Crear Disciplinas | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔧 Configuración Técnica

### Variables de Entorno (.env)

```env
# Database (Supabase + Prisma)
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

# Auth & Public
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[key]"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Comandos de Mantenimiento

```bash
npx prisma generate    # Generar cliente Prisma
npx prisma db push      # Sincronizar esquema con Supabase
npm run dev             # Iniciar entorno local
```

---

_Última actualización: 24 de Marzo, 2026_
_Sistema BlackSheep CrossFit - Documentación del Ecosistema_
