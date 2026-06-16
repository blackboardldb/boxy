import { prisma } from '@/lib/prisma'
import {
  CreateRoutineAssignmentInput,
  CreateRoutineWeekInput,
  CreateRoutineTemplateInput,
  UpdateRoutineTemplateInput,
  CompleteRoutineInput,
  GetRoutinesQueryInput,
} from '@/lib/validations/routine-schemas'

export class RoutineService {

  // ─────────────────────────────────────────────────────────────────────────
  // TEMPLATES
  // ─────────────────────────────────────────────────────────────────────────

  async getTemplates(organizationId: string) {
    return prisma.routineTemplate.findMany({
      where:   { organizationId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id:          true,
        name:        true,
        description: true,
        content:     true,
        createdAt:   true,
        createdBy: {
          select: {
            id:        true,
            firstName: true,
            lastName:  true,
          },
        },
      },
    })
  }

  async createTemplate(
    organizationId: string,
    createdByUserId: string,
    data: CreateRoutineTemplateInput
  ) {
    return prisma.routineTemplate.create({
      data: {
        organizationId,
        createdByUserId,
        name:        data.name,
        description: data.description ?? null,
        content:     data.content as object,
        isActive:    true,
      },
    })
  }

  async updateTemplate(
    organizationId: string,
    templateId: string,
    data: UpdateRoutineTemplateInput
  ) {
    // Verificar que pertenece al centro
    const template = await prisma.routineTemplate.findFirst({
      where: { id: templateId, organizationId },
    })

    if (!template) {
      throw new Error('Template no encontrado')
    }

    return prisma.routineTemplate.update({
      where: { id: templateId },
      data: {
        ...(data.name        !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.content     !== undefined && { content: data.content as object }),
        ...(data.isActive    !== undefined && { isActive: data.isActive }),
      },
    })
  }

  async deleteTemplate(organizationId: string, templateId: string) {
    const template = await prisma.routineTemplate.findFirst({
      where: { id: templateId, organizationId },
    })

    if (!template) {
      throw new Error('Template no encontrado')
    }

    // Soft delete — no borrar físico porque assignments pueden referenciar el template
    return prisma.routineTemplate.update({
      where: { id: templateId },
      data:  { isActive: false },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENTS — consultas
  // ─────────────────────────────────────────────────────────────────────────

  // Para admin/coach — ve todos los assignments del rango con todos sus miembros
  async getAssignments(organizationId: string, query: GetRoutinesQueryInput) {
    const from = new Date(query.from)
    const to   = new Date(query.to)

    return prisma.routineAssignment.findMany({
      where: {
        organizationId,
        assignedDate: { gte: from, lte: to },
        ...(query.userId && {
          members: { some: { userId: query.userId } },
        }),
      },
      orderBy: { assignedDate: 'asc' },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        template: {
          select: { id: true, name: true },
        },
        members: {
          include: {
            user: {
              select: {
                id:        true,
                firstName: true,
                lastName:  true,
                email:     true,
              },
            },
          },
        },
      },
    })
  }

  // Para alumno — solo ve sus assignments con su propia completion
  async getAssignmentsForMember(
    organizationId: string,
    userId: string,
    query: GetRoutinesQueryInput
  ) {
    const from = new Date(query.from)
    const to   = new Date(query.to)

    const members = await prisma.routineAssignmentMember.findMany({
      where: {
        userId,
        assignment: {
          organizationId,
          assignedDate: { gte: from, lte: to },
        },
      },
      orderBy: { assignment: { assignedDate: 'asc' } },
      select: {
        completedAt: true,
        memberNotes: true,
        assignment: {
          select: {
            id:           true,
            assignedDate: true,
            content:      true,
            location:     true,
            notes:        true,
            createdBy: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    // Reshapear para el tipo RoutineAssignmentForMember
    return members.map((m) => ({
      id:           m.assignment.id,
      assignedDate: m.assignment.assignedDate,
      content:      m.assignment.content,
      location:     m.assignment.location,
      notes:        m.assignment.notes,
      createdBy:    m.assignment.createdBy,
      myCompletion: {
        completedAt: m.completedAt,
        memberNotes: m.memberNotes,
      },
    }))
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENTS — creación
  // ─────────────────────────────────────────────────────────────────────────

  async createAssignment(
    organizationId: string,
    createdByUserId: string,
    data: CreateRoutineAssignmentInput
  ) {
    // Verificar que todos los userIds pertenecen al centro
    await this.validateMembersInOrg(organizationId, data.memberUserIds)

    return prisma.$transaction(async (tx) => {
      // Si saveAsTemplate, crear el template primero
      let templateId: string | null = data.templateId ?? null

      if (data.saveAsTemplate && data.templateName) {
        const template = await tx.routineTemplate.create({
          data: {
            organizationId,
            createdByUserId,
            name:    data.templateName,
            content: data.content as object,
            isActive: true,
          },
        })
        templateId = template.id
      }

      // Crear el assignment
      const assignment = await tx.routineAssignment.create({
        data: {
          organizationId,
          createdByUserId,
          assignedDate: new Date(data.assignedDate),
          content:      data.content as object,
          location:     data.location ?? null,
          notes:        data.notes ?? null,
          templateId,
        },
      })

      // Crear los miembros asignados
      await tx.routineAssignmentMember.createMany({
        data: data.memberUserIds.map((userId) => ({
          assignmentId: assignment.id,
          userId,
        })),
      })

      return assignment
    })
  }

  // Crear una semana completa — un assignment por día, mismos alumnos
  async createWeekAssignments(
    organizationId: string,
    createdByUserId: string,
    data: CreateRoutineWeekInput
  ) {
    await this.validateMembersInOrg(organizationId, data.memberUserIds)

    return prisma.$transaction(async (tx) => {
      const assignments = []

      for (const day of data.days) {
        const assignment = await tx.routineAssignment.create({
          data: {
            organizationId,
            createdByUserId,
            assignedDate: new Date(day.assignedDate),
            content:      day.content as object,
            location:     day.location ?? null,
            notes:        day.notes ?? null,
          },
        })

        await tx.routineAssignmentMember.createMany({
          data: data.memberUserIds.map((userId) => ({
            assignmentId: assignment.id,
            userId,
          })),
        })

        assignments.push(assignment)
      }

      // Si saveAsTemplate, guardar el primero como template referencia
      if (data.saveAsTemplate && data.templateName && data.days[0]) {
        await tx.routineTemplate.create({
          data: {
            organizationId,
            createdByUserId,
            name:    data.templateName,
            content: data.days[0].content as object,
            isActive: true,
          },
        })
      }

      return assignments
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENTS — edición y eliminación
  // ─────────────────────────────────────────────────────────────────────────

  async deleteAssignment(organizationId: string, assignmentId: string) {
    const assignment = await prisma.routineAssignment.findFirst({
      where: { id: assignmentId, organizationId },
    })

    if (!assignment) {
      throw new Error('Rutina no encontrada')
    }

    // Cascade en DB elimina los members automáticamente
    return prisma.routineAssignment.delete({
      where: { id: assignmentId },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMPLETION — el alumno marca como completado
  // ─────────────────────────────────────────────────────────────────────────

  async completeAssignment(
    assignmentId: string,
    userId: string,
    data: CompleteRoutineInput
  ) {
    // Verificar que el alumno está asignado a esta rutina
    const member = await prisma.routineAssignmentMember.findUnique({
      where: {
        assignmentId_userId: { assignmentId, userId },
      },
    })

    if (!member) {
      throw new Error('No tienes esta rutina asignada')
    }

    if (member.completedAt) {
      throw new Error('Esta rutina ya fue marcada como completada')
    }

    return prisma.routineAssignmentMember.update({
      where: {
        assignmentId_userId: { assignmentId, userId },
      },
      data: {
        completedAt: new Date(),
        memberNotes: data.memberNotes ?? null,
      },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS INTERNOS
  // ─────────────────────────────────────────────────────────────────────────

  private async validateMembersInOrg(
    organizationId: string,
    userIds: string[]
  ) {
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId,
        userId: { in: userIds },
        status: 'active',
      },
      select: { userId: true },
    })

    if (members.length !== userIds.length) {
      const foundIds  = new Set(members.map((m) => m.userId))
      const missing   = userIds.filter((id) => !foundIds.has(id))
      throw new Error(
        `Los siguientes usuarios no pertenecen al centro: ${missing.join(', ')}`
      )
    }
  }
}

export const routineService = new RoutineService()
