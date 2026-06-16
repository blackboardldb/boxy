// lib/validations/routine-schemas.ts
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUES
// ─────────────────────────────────────────────────────────────────────────────

const VideoUrlSchema = z.object({
  label: z.string().min(1),
  url:   z.string().url(),
})

const TextBlockSchema = z.object({
  kind:      z.literal('text'),
  title:     z.string().min(1, 'El título del bloque es requerido'),
  body:      z.string().min(1, 'El contenido no puede estar vacío'),
  notes:     z.string().optional(),
  videoUrls: z.array(VideoUrlSchema).optional(),
})

const ExerciseBlockSchema = z.object({
  kind:         z.literal('exercise'),
  title:        z.string().min(1, 'El título del bloque es requerido'),
  exerciseId:   z.string().optional(),
  exerciseName: z.string().min(1, 'El nombre del ejercicio es requerido'),
  sets:         z.number().int().positive().optional(),
  reps:         z.union([z.number().int().positive(), z.string()]).optional(),
  duration:     z.number().int().positive().optional(),
  rest:         z.number().int().min(0).optional(),
  weight:       z.string().optional(),
  notes:        z.string().optional(),
  videoUrls:    z.array(VideoUrlSchema).optional(),
})

const RoutineBlockSchema = z.discriminatedUnion('kind', [
  TextBlockSchema,
  ExerciseBlockSchema,
])

export const RoutineContentSchema = z.object({
  blocks: z.array(RoutineBlockSchema).min(1, 'La rutina debe tener al menos un bloque'),
})

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const CreateRoutineTemplateSchema = z.object({
  name:        z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  content:     RoutineContentSchema,
})

export const UpdateRoutineTemplateSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  content:     RoutineContentSchema.optional(),
  isActive:    z.boolean().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGNMENTS
// ─────────────────────────────────────────────────────────────────────────────

// Fecha como string ISO "YYYY-MM-DD" — se valida formato
const ISODateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD')

export const CreateRoutineAssignmentSchema = z
  .object({
    assignedDate:    ISODateString,
    content:         RoutineContentSchema,
    location:        z.string().max(200).optional(),
    notes:           z.string().max(1000).optional(),
    templateId:      z.string().optional(),
    memberUserIds:   z.array(z.string()).min(1, 'Debe asignar al menos un alumno'),
    saveAsTemplate:  z.boolean().optional().default(false),
    templateName:    z.string().max(100).optional(),
  })
  .refine(
    (data) => !data.saveAsTemplate || (data.templateName && data.templateName.length > 0),
    {
      message: 'El nombre del template es requerido al guardar como template',
      path: ['templateName'],
    }
  )

// Un día dentro del payload de semana
const RoutineWeekDaySchema = z.object({
  assignedDate: ISODateString,
  content:      RoutineContentSchema,
  location:     z.string().max(200).optional(),
  notes:        z.string().max(1000).optional(),
})

export const CreateRoutineWeekSchema = z
  .object({
    days:           z.array(RoutineWeekDaySchema).min(1).max(7),
    memberUserIds:  z.array(z.string()).min(1, 'Debe asignar al menos un alumno'),
    saveAsTemplate: z.boolean().optional().default(false),
    templateName:   z.string().max(100).optional(),
  })
  .refine(
    (data) => !data.saveAsTemplate || (data.templateName && data.templateName.length > 0),
    {
      message: 'El nombre del template es requerido al guardar como template',
      path: ['templateName'],
    }
  )

export const CompleteRoutineSchema = z.object({
  memberNotes: z.string().max(1000).optional(),
})

export const GetRoutinesQuerySchema = z.object({
  from:   ISODateString,
  to:     ISODateString,
  userId: z.string().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// EJERCICIOS CUSTOM (creados por el centro)
// ─────────────────────────────────────────────────────────────────────────────

export const CreateCustomExerciseSchema = z.object({
  name:        z.string().min(1, 'El nombre es requerido').max(100),
  category:    z.enum(['fuerza', 'potencia', 'gimnasia', 'cardio', 'movilidad', 'otro']).optional(),
  muscleGroup: z.enum(['piernas', 'espalda', 'pecho', 'hombros', 'brazos', 'core', 'full_body']).optional(),
  description: z.string().max(500).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS INFERIDOS — para usar en handlers sin redefinir
// ─────────────────────────────────────────────────────────────────────────────

export type CreateRoutineTemplateInput  = z.infer<typeof CreateRoutineTemplateSchema>
export type UpdateRoutineTemplateInput  = z.infer<typeof UpdateRoutineTemplateSchema>
export type CreateRoutineAssignmentInput = z.infer<typeof CreateRoutineAssignmentSchema>
export type CreateRoutineWeekInput      = z.infer<typeof CreateRoutineWeekSchema>
export type CompleteRoutineInput        = z.infer<typeof CompleteRoutineSchema>
export type GetRoutinesQueryInput       = z.infer<typeof GetRoutinesQuerySchema>
export type CreateCustomExerciseInput   = z.infer<typeof CreateCustomExerciseSchema>
