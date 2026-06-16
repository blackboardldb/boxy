// lib/types/routine.ts

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUES DE CONTENIDO
// ─────────────────────────────────────────────────────────────────────────────

export type BlockKind = 'text' | 'exercise'

export interface TextBlock {
  kind: 'text'
  title: string       // requerido — describe la sección: "Calentamiento", "Metcon", etc.
  body: string        // requerido — contenido libre en texto plano o markdown simple
  notes?: string      // opcional — indicaciones adicionales del coach
  videoUrls?: Array<{ label: string; url: string }> // opcional — links de referencia
}

export interface ExerciseBlock {
  kind: 'exercise'
  title: string          // requerido — nombre display del ejercicio
  exerciseId?: string    // opcional — ID de la librería. null = ejercicio escrito a mano
  exerciseName: string   // requerido siempre — para display sin depender del ID
  sets?: number
  reps?: number | string // number: 10 | string: "8-12" | "AMRAP"
  duration?: number      // segundos — alternativa a reps para ejercicios por tiempo
  rest?: number          // segundos de descanso entre series
  weight?: string        // texto libre: "70kg" | "RPE 8" | "60% 1RM" | "bodyweight"
  notes?: string         // indicaciones técnicas: "bajar hasta paralelo"
  videoUrls?: Array<{ label: string; url: string }> // opcional — demos del ejercicio
}

export type RoutineBlock = TextBlock | ExerciseBlock

export interface RoutineContent {
  blocks: RoutineBlock[]
}

// ─────────────────────────────────────────────────────────────────────────────
// EJERCICIOS DE LA LIBRERÍA
// ─────────────────────────────────────────────────────────────────────────────

export type ExerciseCategory =
  | 'fuerza'
  | 'potencia'
  | 'gimnasia'
  | 'cardio'
  | 'movilidad'
  | 'otro'

export type MuscleGroup =
  | 'piernas'
  | 'espalda'
  | 'pecho'
  | 'hombros'
  | 'brazos'
  | 'core'
  | 'full_body'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory | null
  muscleGroup: MuscleGroup | null
  description: string | null
  isCustom: boolean
  organizationId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export interface RoutineTemplate {
  id: string
  organizationId: string
  name: string
  description: string | null
  content: RoutineContent
  isActive: boolean
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
}

// Con el nombre del creador — para display en la biblioteca
export interface RoutineTemplateWithCreator extends RoutineTemplate {
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGNMENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface RoutineAssignment {
  id: string
  organizationId: string
  assignedDate: Date
  content: RoutineContent
  location: string | null
  notes: string | null
  templateId: string | null
  createdByUserId: string
  createdAt: Date
  updatedAt: Date
}

// Miembro asignado — con estado de completion
export interface RoutineAssignmentMember {
  id: string
  assignmentId: string
  userId: string
  completedAt: Date | null
  memberNotes: string | null
  createdAt: Date
}

// Assignment completo — para vista admin/coach
export interface RoutineAssignmentFull extends RoutineAssignment {
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
  template: {
    id: string
    name: string
  } | null
  members: Array<
    RoutineAssignmentMember & {
      user: {
        id: string
        firstName: string
        lastName: string
        email: string
      }
    }
  >
}

// Assignment para vista alumno — solo ve su propia completion
export interface RoutineAssignmentForMember {
  id: string
  assignedDate: Date
  content: RoutineContent
  location: string | null
  notes: string | null
  createdBy: {
    firstName: string
    lastName: string
  }
  myCompletion: {
    completedAt: Date | null
    memberNotes: string | null
  } | null
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOADS DE API — REQUEST / RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/routine-templates
export interface CreateRoutineTemplatePayload {
  name: string
  description?: string
  content: RoutineContent
}

// PUT /api/routine-templates/[id]
export interface UpdateRoutineTemplatePayload {
  name?: string
  description?: string
  content?: RoutineContent
  isActive?: boolean
}

// POST /api/routines — crear assignment
export interface CreateRoutineAssignmentPayload {
  assignedDate: string          // ISO date string: "2026-06-15"
  content: RoutineContent
  location?: string
  notes?: string
  templateId?: string
  memberUserIds: string[]       // mínimo 1
  saveAsTemplate?: boolean      // si true, templateName es requerido
  templateName?: string
}

// POST /api/routines — crear semana completa
export interface CreateRoutineWeekPayload {
  days: Array<{
    assignedDate: string
    content: RoutineContent
    location?: string
    notes?: string
  }>
  memberUserIds: string[]       // mismos alumnos para toda la semana
  saveAsTemplate?: boolean
  templateName?: string
}

// POST /api/routines/[id]/complete
export interface CompleteRoutinePayload {
  memberNotes?: string
}

// GET /api/routines — query params
export interface GetRoutinesQuery {
  from: string   // ISO date
  to: string     // ISO date
  userId?: string // si viene, filtra por alumno específico
}
