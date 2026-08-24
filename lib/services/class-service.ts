// lib/services/class-service.ts
// Migrado (Bloque 1 — Prisma Provider): ya no extiende BaseService ni pasa
// por PrismaClassRepository. Prisma directo, fusionando lo que antes hacía
// el repository (select, paginación, mapToEntity) en este mismo archivo.

import { prisma } from "../prisma";
import { ClassSession, ClassStatus, Discipline } from "../types";
import { ApiResponse, PaginatedApiResponse, createSuccessResponse, createPaginatedResponse } from "../api/types";
import { ValidationError, NotFoundError } from "../errors/types";
import { withErrorHandling } from "../errors/handler";
import { startOfDayChile, endOfDayChile } from "../utils";
import { ValidationService } from "../validation-service";
import { userService } from "./user-service";

type ClassRowWithRegistrations = {
  id: string;
  name: string;
  organizationId: string;
  disciplineId: string;
  dateTime: Date;
  durationMinutes: number;
  instructorId: string;
  capacity: number;
  status: string;
  notes: string | null;
  isGenerated: boolean;
  _count: { registrations: number };
};

const defaultSelect = {
  id: true,
  organizationId: true,
  name: true,
  dateTime: true,
  durationMinutes: true,
  instructorId: true,
  disciplineId: true,
  capacity: true,
  status: true,
  notes: true,
  isGenerated: true,
  _count: {
    select: {
      registrations: { where: { status: "registered" } },
    },
  },
} as const;

function mapToEntity(row: ClassRowWithRegistrations): ClassSession {
  return {
    id: row.id,
    organizationId: row.organizationId || "",
    disciplineId: row.disciplineId || "",
    name: row.name || "",
    dateTime: row.dateTime?.toISOString() || new Date().toISOString(),
    durationMinutes: row.durationMinutes || 60,
    instructorId: row.instructorId || "",
    capacity: row.capacity || 15,
    status: (row.status as ClassStatus) || "scheduled",
    notes: row.notes || undefined,
    isGenerated: !!row.isGenerated,
    enrolledCount: row._count?.registrations ?? 0,
  } as ClassSession;
}

export class ClassService {
  async getClasses(params?: {
    page?: number;
    limit?: number;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    disciplineId?: string;
    instructorId?: string;
    status?: string;
  }): Promise<PaginatedApiResponse<ClassSession>> {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // MT-06: filtrar por tenant — obligatorio para aislar clases por centro
    if (params?.organizationId) where.organizationId = params.organizationId;
    if (params?.disciplineId) where.disciplineId = params.disciplineId;
    if (params?.instructorId) where.instructorId = params.instructorId;
    if (params?.status) where.status = params.status;

    if (params?.startDate || params?.endDate) {
      const dateTimeFilter: Record<string, Date> = {};
      if (params.startDate) {
        dateTimeFilter.gte = params.startDate.includes("T")
          ? new Date(params.startDate)
          : startOfDayChile(params.startDate);
      }
      if (params.endDate) {
        dateTimeFilter.lte = params.endDate.includes("T")
          ? new Date(params.endDate)
          : endOfDayChile(params.endDate);
      }
      where.dateTime = dateTimeFilter;
    }

    const [classes, total] = await Promise.all([
      prisma.classSession.findMany({
        where,
        orderBy: { dateTime: "asc" },
        take: limit,
        skip,
        select: defaultSelect,
      }),
      prisma.classSession.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return createPaginatedResponse(
      classes.map((c) => mapToEntity(c as unknown as ClassRowWithRegistrations)),
      { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    );
  }

  async getClassById(id: string, organizationId: string): Promise<ApiResponse<ClassSession | null>> {
    
    // Usamos findFirst porque con organizationId ya no es un query único (PK)
    const row = await prisma.classSession.findFirst({ 
      where: { id, organizationId }, 
      select: defaultSelect 
    });
    const data = row ? mapToEntity(row as unknown as ClassRowWithRegistrations) : null;
    return createSuccessResponse(data);
  }

  async createClass(data: Partial<ClassSession>): Promise<ApiResponse<ClassSession>> {
    return withErrorHandling(async () => {
      if (!data.disciplineId || !data.instructorId || !data.dateTime) {
        throw new ValidationError("Faltan campos requeridos");
      }
      if (!data.organizationId) throw new ValidationError("organizationId is required");

      const created = await prisma.classSession.create({
        data: {
          id: data.id,
          organizationId: data.organizationId,
          disciplineId: data.disciplineId,
          name: data.name!,
          dateTime: new Date(data.dateTime as string),
          durationMinutes: data.durationMinutes || 60,
          instructorId: data.instructorId,
          capacity: data.capacity || 15,
          status: data.status || "scheduled",
          notes: data.notes,
          isGenerated: data.isGenerated || false,
        },
        select: defaultSelect,
      });
      return createSuccessResponse(mapToEntity(created as unknown as ClassRowWithRegistrations));
    }, { operation: "createClass", resource: "classes" });
  }

  async updateClass(id: string, data: Partial<ClassSession>, organizationId: string): Promise<ApiResponse<ClassSession>> {
    return withErrorHandling(async () => {
      // findFirst con organizationId: el NotFoundError es intencionalmente
      // indistinguible entre "no existe" y "existe pero pertenece a otro tenant".
      const existing = await prisma.classSession.findFirst({ where: { id, organizationId } });
      if (!existing) throw new NotFoundError("classes", id);

      const updated = await prisma.classSession.update({
        where: { id },
        data: {
          disciplineId: data.disciplineId,
          name: data.name,
          dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
          durationMinutes: data.durationMinutes,
          instructorId: data.instructorId,
          capacity: data.capacity,
          status: data.status,
          notes: data.notes,
          isGenerated: data.isGenerated,
        },
        select: defaultSelect,
      });
      return createSuccessResponse(mapToEntity(updated as unknown as ClassRowWithRegistrations));
    }, { operation: "updateClass", resource: "classes", metadata: { id } });
  }

  async deleteClass(id: string, organizationId: string): Promise<ApiResponse<ClassSession>> {
    return withErrorHandling(async () => {
      const existing = await prisma.classSession.findFirst({ where: { id, organizationId } });
      if (!existing) throw new NotFoundError("classes", id);

      const deleted = await prisma.classSession.delete({ where: { id }, select: defaultSelect });
      return createSuccessResponse(mapToEntity(deleted as unknown as ClassRowWithRegistrations));
    }, { operation: "deleteClass", resource: "classes", metadata: { id } });
  }

  // REGISTRATION OPERATIONS

  async registerStudent(classId: string, userId: string, options: { isAdmin?: boolean } = {}): Promise<ApiResponse<ClassSession>> {
    return withErrorHandling(async () => {
      const classSession = await prisma.classSession.findUnique({
        where: { id: classId },
        select: { id: true, organizationId: true, capacity: true, status: true, dateTime: true },
      });
      if (!classSession) throw new ValidationError("Clase no encontrada");

      const user = await userService.getUserScopedToOrg(userId, classSession.organizationId);
      if (!user) throw new ValidationError("Usuario no encontrado");
      if (classSession.status === "cancelled") throw new ValidationError("La clase ha sido cancelada");

      const isReg = await prisma.classRegistration.findUnique({
        where: { userId_classId: { userId, classId } },
      });
      if (isReg && isReg.status === "registered") throw new ValidationError("Ya estás inscrito/a en esta clase");

      if (!options.isAdmin) {
        const targetDay = classSession.dateTime.toISOString().split("T")[0];
        const queryStart = new Date(`${targetDay}T00:00:00`);
        const queryEnd = new Date(`${targetDay}T23:59:59`);
        const dayRegistrations = await prisma.classRegistration.findMany({
          where: {
            userId,
            status: "registered",
            class: {
              organizationId: classSession.organizationId,
              dateTime: { gte: queryStart, lte: queryEnd },
            },
          },
          include: { class: true },
        });
        const validation = await ValidationService.canUserRegisterToClass(
          userId,
          classSession as unknown as ClassSession,
          dayRegistrations.map((r) => r.class) as unknown as ClassSession[]
        );
        if (!validation.canRegister) throw new ValidationError(validation.reason || "Validation failed");
      }

      // === ZONA CRÍTICA: lock + re-check + count + insert, todo atómico ===
      const updatedRecord = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM class_sessions WHERE id = ${classId} FOR UPDATE`;

        const liveSession = await tx.classSession.findUnique({
          where: { id: classId },
          select: { capacity: true, status: true },
        });
        if (!liveSession || liveSession.status === "cancelled") {
          throw new ValidationError("La clase ya no está disponible");
        }

        const enrolledCount = await tx.classRegistration.count({
          where: { classId, status: "registered" },
        });
        if (enrolledCount >= liveSession.capacity) {
          throw new ValidationError("No hay cupos disponibles");
        }

        await tx.classRegistration.upsert({
          where: { userId_classId: { userId, classId } },
          update: { status: "registered", registeredAt: new Date() },
          create: { userId, classId, status: "registered" },
        });

        return tx.classSession.findUnique({ where: { id: classId }, select: defaultSelect });
      }, {
        maxWait: 10000,
        timeout: 15000,
      });

      return createSuccessResponse(mapToEntity(updatedRecord as unknown as ClassRowWithRegistrations));
    }, { operation: "registerStudent", resource: "classes", metadata: { classId, userId, isAdmin: options.isAdmin } });
  }

  async cancelRegistration(classId: string, userId: string): Promise<ApiResponse<ClassSession>> {
    return withErrorHandling(async () => {
      const classSession = await prisma.classSession.findUnique({ where: { id: classId } });
      if (!classSession) throw new ValidationError("Clase no encontrada");

      const user = await userService.getUserScopedToOrg(userId, classSession.organizationId);
      if (!user) throw new ValidationError("Usuario no encontrado");

      const discipline = await prisma.discipline.findUnique({ where: { id: classSession.disciplineId } });
      if (!discipline) throw new ValidationError("Disciplina no encontrada");

      const validation = await ValidationService.canUserCancelClassWithRules(
        userId,
        classSession as unknown as ClassSession,
        discipline as unknown as Discipline
      );
      if (!validation.canCancel) throw new ValidationError(validation.reason || "No se puede cancelar");

      const updatedRecord = await prisma.$transaction(async (tx) => {
        await tx.classRegistration.update({
          where: { userId_classId: { userId, classId } },
          data: { status: "cancelled", cancelledAt: new Date() },
        });
        return tx.classSession.findUnique({ where: { id: classId }, select: defaultSelect });
      });

      return createSuccessResponse(mapToEntity(updatedRecord as unknown as ClassRowWithRegistrations));
    }, { operation: "cancelRegistration", resource: "classes", metadata: { classId, userId } });
  }

  async healthCheck(): Promise<ApiResponse<{ status: "healthy" | "unhealthy"; details: Record<string, any> }>> {
    try {
      await prisma.classSession.count();
      return createSuccessResponse({
        status: "healthy" as const,
        details: { serviceName: "classes", timestamp: new Date().toISOString() },
      });
    } catch (error) {
      return createSuccessResponse({
        status: "unhealthy" as const,
        details: {
          serviceName: "classes",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

export const classService = new ClassService();
