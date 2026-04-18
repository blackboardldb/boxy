import { BaseService } from "./base-service";
import { ClassSession } from "../types";
import { ClassRepository } from "../data-layer/types";
import { ApiResponse, PaginatedApiResponse, createSuccessResponse } from "../api/types";
import { ValidationError } from "../errors/types";
import { getChileOffset } from "../utils";
import { prisma } from "../prisma";
import { ValidationService } from "../validation-service";

export class ClassService extends BaseService<ClassSession> {
  protected repositoryName = "classes" as const;

  // Get the typed class repository
  private get classRepository(): ClassRepository {
    return this.repository as ClassRepository;
  }

  // Enhanced methods using new architecture

  // Get classes with pagination and filtering
  async getClasses(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    disciplineId?: string;
    instructorId?: string;
    status?: string;
  }): Promise<PaginatedApiResponse<ClassSession>> {
    const findParams: {
      page: number;
      limit: number;
      where?: Record<string, unknown>;
      orderBy?: Record<string, "asc" | "desc">;
    } = {
      page: params?.page || 1,
      limit: params?.limit || 50,
    };

    // Build where clause
    const where: Record<string, unknown> = {};

    if (params?.disciplineId) {
      where.disciplineId = params.disciplineId;
    }

    if (params?.instructorId) {
      where.instructorId = params.instructorId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    // Date range filtering
    if (params?.startDate || params?.endDate) {
      const dateTimeFilter: Record<string, Date> = {};
      if (params.startDate) {
        const offset = getChileOffset(new Date(`${params.startDate}T12:00:00`));
        const startStr = params.startDate.includes("T") 
          ? params.startDate 
          : `${params.startDate}T00:00:00.000${offset}`;
        dateTimeFilter.gte = new Date(startStr);
      }
      if (params.endDate) {
        const offset = getChileOffset(new Date(`${params.endDate}T12:00:00`));
        const endStr = params.endDate.includes("T") 
          ? params.endDate 
          : `${params.endDate}T23:59:59.999${offset}`;
        dateTimeFilter.lte = new Date(endStr);
      }
      where.dateTime = dateTimeFilter;
    }

    if (Object.keys(where).length > 0) {
      findParams.where = where;
    }

    findParams.orderBy = { dateTime: "asc" };

    return await this.findMany(findParams);
  }

  // Create a new class
  async createClass(
    data: Partial<ClassSession>
  ): Promise<ApiResponse<ClassSession>> {
    return await this.create(data);
  }

  // Update an existing class
  async updateClass(
    id: string,
    data: Partial<ClassSession>
  ): Promise<ApiResponse<ClassSession>> {
    return await this.update(id, data);
  }

  // Delete a class
  async deleteClass(id: string): Promise<ApiResponse<ClassSession>> {
    return await this.delete(id);
  }

  // REGISTRATION OPERATIONS

  /**
   * Universal registration method (handles validation, daily limits, and transactions)
   */
  async registerStudent(
    classId: string, 
    userId: string, 
    options: { isAdmin?: boolean } = {}
  ): Promise<ApiResponse<ClassSession>> {
    const { withErrorHandling } = require("../errors/handler");
    
    return withErrorHandling(
      async () => {
        const provider = this.dataProvider;
        
        // 1. Fetch data
        const [classSession, user] = await Promise.all([
          provider.classes.findUnique({ where: { id: classId } }),
          provider.users.findUnique({ where: { id: userId } })
        ]);

        if (!classSession) throw new ValidationError("Clase no encontrada");
        if (!user) throw new ValidationError("Usuario no encontrado");

        // 2. VALIDATION
        if (classSession.status === "cancelled") throw new ValidationError("La clase ha sido cancelada");
        if (classSession.registeredParticipantsIds.includes(userId)) throw new ValidationError("Ya estás inscrito/a en esta clase");
        if (classSession.registeredParticipantsIds.length >= classSession.capacity) throw new ValidationError("No hay cupos disponibles");

        if (!options.isAdmin) {
          const targetDay = classSession.dateTime.split("T")[0];
          const queryStart = new Date(`${targetDay}T00:00:00`);
          const queryEnd = new Date(`${targetDay}T23:59:59`);
          
          const dayRegistrations = await prisma.classRegistration.findMany({
            where: {
              userId,
              status: 'registered',
              class: { dateTime: { gte: queryStart, lte: queryEnd } }
            },
            include: { class: true }
          });

          // HAL-01 Fase 4 Sprint 4 pre-DROP: inyectar remainingClasses desde ClassRegistration.
          // Lee classLimit y currentPeriodStart desde UserMembership (tabla relacional).
          let userForValidation: any = user;

          const userMembership = await prisma.userMembership.findUnique({
            where: { userId },
            select: { classLimit: true, currentPeriodStart: true },
          });

          const classLimit = userMembership?.classLimit ?? 0;
          if (classLimit > 0) {
            const periodStart = userMembership?.currentPeriodStart
              ? new Date(userMembership.currentPeriodStart)
              : new Date(0);
            const classesUsed = await prisma.classRegistration.count({
              where: { userId, status: 'registered', class: { dateTime: { gte: periodStart } } }
            });
            userForValidation = {
              ...user,
              membership: {
                ...(user.membership as any),
                centerStats: {
                  ...(user.membership as any)?.centerStats,
                  currentMonth: {
                    ...(user.membership as any)?.centerStats?.currentMonth,
                    remainingClasses: Math.max(0, classLimit - classesUsed)
                  }
                }
              }
            };
          }

          const validation = await ValidationService.canUserRegisterToClass(
            userForValidation,
            classSession as any,
            dayRegistrations.map(r => r.class) as any
          );

          if (!validation.canRegister) {
            throw new ValidationError(validation.reason || "Validation failed");
          }
        }

        // 3. TRANSACTION
        // HAL-09b: eliminado tx.user.update membership JSONB — ya no es necesario.
        // remainingClasses se calcula desde ClassRegistration en la validación.
        const updatedRecord = await prisma.$transaction(async (tx) => {
          await tx.classRegistration.upsert({
            where: { userId_classId: { userId, classId } },
            update: { status: 'registered', registeredAt: new Date() },
            create: { userId, classId, status: 'registered' }
          });

          const updatedClass = await tx.classSession.update({
            where: { id: classId },
            data: {
              registeredParticipantsIds: [
                ...classSession.registeredParticipantsIds.filter(id => id !== userId),
                userId
              ]
            }
          });
          
          return updatedClass;
        });

        return createSuccessResponse(this.mapToEntity(updatedRecord));
      },
      { operation: "registerStudent", resource: "classes", metadata: { classId, userId, isAdmin: options.isAdmin } }
    );
  }

  /**
   * Universal cancellation method
   */
  async cancelRegistration(classId: string, userId: string): Promise<ApiResponse<ClassSession>> {
    const { withErrorHandling } = require("../errors/handler");

    return withErrorHandling(
      async () => {
        const provider = this.dataProvider;
        const [classSession, user] = await Promise.all([
          provider.classes.findUnique({ where: { id: classId } }),
          provider.users.findUnique({ where: { id: userId } })
        ]);

        if (!classSession) throw new ValidationError("Clase no encontrada");
        if (!user) throw new ValidationError("Usuario no encontrado");

        const discipline = await prisma.discipline.findUnique({ where: { id: classSession.disciplineId } });
        if (!discipline) throw new ValidationError("Disciplina no encontrada");

        const validation = await ValidationService.canUserCancelClassWithRules(
          user as any,
          classSession as any,
          discipline as any
        );

        if (!validation.canCancel) {
          throw new ValidationError(validation.reason || "No se puede cancelar");
        }

        // HAL-09b: eliminado tx.user.update membership JSONB — ya no es necesario.
        // remainingClasses se recalcula desde ClassRegistration en cada validación.
        const updatedRecord = await prisma.$transaction(async (tx) => {
          await tx.classRegistration.update({
            where: { userId_classId: { userId, classId } },
            data: { status: 'cancelled', cancelledAt: new Date() }
          });

          const updatedClass = await tx.classSession.update({
            where: { id: classId },
            data: {
              registeredParticipantsIds: classSession.registeredParticipantsIds.filter(id => id !== userId),
              waitlistParticipantsIds: classSession.waitlistParticipantsIds.filter(id => id !== userId)
            }
          });

          return updatedClass;
        });

        return createSuccessResponse(this.mapToEntity(updatedRecord));
      },
      { operation: "cancelRegistration", resource: "classes", metadata: { classId, userId } }
    );
  }

  private mapToEntity(prismaClass: any): ClassSession {
    return {
      id: prismaClass.id,
      organizationId: prismaClass.organizationId,
      disciplineId: prismaClass.disciplineId,
      name: prismaClass.name,
      dateTime: prismaClass.dateTime.toISOString(),
      durationMinutes: prismaClass.durationMinutes,
      instructorId: prismaClass.instructorId,
      capacity: prismaClass.capacity,
      registeredParticipantsIds: prismaClass.registeredParticipantsIds || [],
      waitlistParticipantsIds: prismaClass.waitlistParticipantsIds || [],
      status: prismaClass.status as any,
      notes: prismaClass.notes || undefined,
      isGenerated: prismaClass.isGenerated,
    };
  }

  protected async validateCreateData(data: Partial<ClassSession>): Promise<void> {
    if (!data.disciplineId || !data.instructorId || !data.dateTime) {
      throw new ValidationError("Faltan campos requeridos");
    }
  }

  protected async validateUpdateData(id: string, data: Partial<ClassSession>): Promise<void> {
    // validation...
  }
}

export const classService = new ClassService();
