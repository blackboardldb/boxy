import { prisma } from '@/lib/prisma'
import { CreateCustomExerciseInput } from '@/lib/validations/routine-schemas'

export class ExerciseService {

  // ─────────────────────────────────────────────────────────────────────────
  // Listar ejercicios — globales + custom del centro
  // El cliente recibe ambos mezclados, ordenados por nombre
  // ─────────────────────────────────────────────────────────────────────────
  async getExercises(organizationId: string) {
    const exercises = await prisma.exercise.findMany({
      where: {
        isActive: true,
        OR: [
          { organizationId: null },        // globales de Boxy
          { organizationId },              // custom del centro
        ],
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id:             true,
        name:           true,
        category:       true,
        muscleGroup:    true,
        description:    true,
        isCustom:       true,
        organizationId: true,
        isActive:       true,
      },
    })

    return exercises
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Buscar ejercicios — para el input del modal
  // Busca por nombre, filtra globales + del centro
  // ─────────────────────────────────────────────────────────────────────────
  async searchExercises(organizationId: string, query: string) {
    const exercises = await prisma.exercise.findMany({
      where: {
        isActive: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
        OR: [
          { organizationId: null },
          { organizationId },
        ],
      },
      orderBy: { name: 'asc' },
      take: 20,   // límite para el autocomplete
      select: {
        id:          true,
        name:        true,
        category:    true,
        muscleGroup: true,
        isCustom:    true,
      },
    })

    return exercises
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Crear ejercicio custom del centro
  // Solo ADMIN puede crear ejercicios custom
  // ─────────────────────────────────────────────────────────────────────────
  async createCustomExercise(
    organizationId: string,
    data: CreateCustomExerciseInput
  ) {
    // Verificar que no exista ya con ese nombre en este centro o global
    const existing = await prisma.exercise.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
        OR: [
          { organizationId: null },
          { organizationId },
        ],
      },
    })

    if (existing) {
      throw new Error(`Ya existe un ejercicio con el nombre "${data.name}"`)
    }

    const exercise = await prisma.exercise.create({
      data: {
        name:           data.name,
        category:       data.category ?? null,
        muscleGroup:    data.muscleGroup ?? null,
        description:    data.description ?? null,
        isCustom:       true,
        organizationId,
        isActive:       true,
      },
    })

    return exercise
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Desactivar ejercicio custom del centro
  // Solo puede desactivar ejercicios propios del centro, nunca los globales
  // ─────────────────────────────────────────────────────────────────────────
  async deactivateCustomExercise(organizationId: string, exerciseId: string) {
    const exercise = await prisma.exercise.findFirst({
      where: {
        id:             exerciseId,
        organizationId,       // solo del centro — nunca globales
        isCustom:       true,
      },
    })

    if (!exercise) {
      throw new Error('Ejercicio no encontrado o no pertenece a este centro')
    }

    return prisma.exercise.update({
      where: { id: exerciseId },
      data:  { isActive: false },
    })
  }
}

export const exerciseService = new ExerciseService()
