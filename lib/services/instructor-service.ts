import { prisma } from "../prisma";
import { Instructor } from "../types";
import { ApiResponse, PaginatedApiResponse } from "../api/types";
import { generatedSchemas, validateWithSchema } from "../types/generator";
import { ValidationError } from "../errors/types";
import { PrismaInstructorRepository } from "../data-layer/repositories/instructor-repository";
import { Prisma } from "@prisma/client";

type InstructorProfile = { specialties?: string[]; userId?: string };

// Cache simple en memoria, scopeada por organizationId en la key
const cache = new Map<string, { data: any; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached(key: string, data: any, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function clearCache(): void {
  cache.clear();
}

function mapToEntity(prismaInstructor: any): Instructor {
  const profile = (prismaInstructor.profile as InstructorProfile) || {};
  return {
    id: prismaInstructor.id,
    organizationId: prismaInstructor.organizationId,
    firstName: prismaInstructor.firstName,
    lastName: prismaInstructor.lastName,
    email: prismaInstructor.email,
    phone: prismaInstructor.phone || undefined,
    role: prismaInstructor.role as "admin" | "coach",
    isActive: prismaInstructor.isActive,
    specialties: profile.specialties || [],
    userId: profile.userId,
  };
}

export class InstructorService {
  // instancia interna solo para reusar findByDiscipline/findByStatus/getInstructorStats
  // sin duplicar esa lógica (mismo patrón que getUserScopedToOrg de user-service)
  private repository = new PrismaInstructorRepository();

  async getInstructors(params: {
    page?: number;
    limit?: number;
    organizationId: string; // ahora obligatorio, no opcional
    search?: string;
    role?: string;
    isActive?: boolean;
    minimal?: boolean;
  }): Promise<PaginatedApiResponse<Instructor>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InstructorWhereInput = {
      organizationId: params.organizationId,
    };

    if (params.role && params.role !== "todos") {
      where.role = params.role;
    }
    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: "insensitive" } },
        { lastName: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const select: Prisma.InstructorSelect = params.minimal
      ? { id: true, firstName: true, lastName: true }
      : {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          profile: true,
        };

    const [instructors, total] = await Promise.all([
      prisma.instructor.findMany({ where, select, take: limit, skip }),
      prisma.instructor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: instructors.map(mapToEntity),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getInstructorById(id: string): Promise<ApiResponse<Instructor | null>> {
    const instructor = await prisma.instructor.findUnique({ where: { id } });
    return {
      success: true,
      data: instructor ? mapToEntity(instructor) : null,
      meta: { timestamp: new Date().toISOString(), processingTime: 0 },
    };
  }

  // FIX: requiere organizationId, cache key scopeada
  async getActiveInstructors(organizationId: string): Promise<ApiResponse<Instructor[]>> {
    const cacheKey = `active_instructors:${organizationId}`;
    const cached = getCached<Instructor[]>(cacheKey);
    if (cached) {
      return { success: true, data: cached, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
    }

    const instructors = await this.repository.findByStatus("active", organizationId);
    setCached(cacheKey, instructors, 10 * 60 * 1000);

    return { success: true, data: instructors, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  // FIX: requiere organizationId
  async getInstructorsByDiscipline(
    disciplineId: string,
    organizationId: string
  ): Promise<ApiResponse<Instructor[]>> {
    try {
      const instructors = await this.repository.findByDiscipline(disciplineId, organizationId);
      return { success: true, data: instructors, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
    } catch (error) {
      console.error("[InstructorService] getInstructorsByDiscipline failed:", error);
      throw error;
    }
  }

  async createInstructor(instructorData: any): Promise<ApiResponse<Instructor>> {
    await this.validateCreateData(instructorData);

    const created = await prisma.instructor.create({
      data: {
        organizationId: instructorData.organizationId,
        firstName: instructorData.firstName,
        lastName: instructorData.lastName,
        email: instructorData.email.toLowerCase(),
        phone: instructorData.phone,
        role: instructorData.role || "coach",
        isActive: instructorData.isActive ?? true,
        profile: {
          specialties: instructorData.specialties || [],
          userId: instructorData.userId,
        },
      },
    });

    clearCache();
    console.log(`[InstructorService] Instructor created: ${created.id} (${created.firstName} ${created.lastName})`);

    return { success: true, data: mapToEntity(created), meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  async updateInstructor(id: string, instructorData: any): Promise<ApiResponse<Instructor>> {
    const existing = await prisma.instructor.findUnique({ where: { id } });
    if (!existing) {
      throw new ValidationError("Instructor not found");
    }
    const existingEntity = mapToEntity(existing);

    await this.validateUpdateData(id, instructorData, existingEntity);

    const currentProfile = (existing.profile as InstructorProfile) || {};
    const updated = await prisma.instructor.update({
      where: { id },
      data: {
        firstName: instructorData.firstName,
        lastName: instructorData.lastName,
        email: instructorData.email ? instructorData.email.toLowerCase() : undefined,
        phone: instructorData.phone,
        role: instructorData.role,
        isActive: instructorData.isActive,
        profile: {
          ...currentProfile,
          specialties: instructorData.specialties !== undefined ? instructorData.specialties : currentProfile.specialties,
          userId: instructorData.userId !== undefined ? instructorData.userId : currentProfile.userId,
        },
      },
    });

    clearCache();
    if (existingEntity.isActive !== updated.isActive) {
      console.log(
        `[InstructorService] Instructor status changed: ${updated.id} (${existingEntity.isActive ? "active" : "inactive"} -> ${updated.isActive ? "active" : "inactive"})`
      );
    }

    return { success: true, data: mapToEntity(updated), meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  async deleteInstructor(id: string): Promise<ApiResponse<Instructor>> {
    const existing = await prisma.instructor.findUnique({ where: { id } });
    if (!existing) {
      throw new ValidationError("Instructor not found");
    }
    await this.validateDelete(id);

    const deleted = await prisma.instructor.delete({ where: { id } });
    clearCache();
    console.log(`[InstructorService] Instructor deleted: ${deleted.id} (${deleted.firstName} ${deleted.lastName})`);

    return { success: true, data: mapToEntity(deleted), meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  async toggleInstructorStatus(id: string): Promise<ApiResponse<Instructor>> {
    const current = await this.getInstructorById(id);
    if (!current.success || !current.data) {
      throw new ValidationError("Instructor not found");
    }
    const updated = await this.updateInstructor(id, { isActive: !current.data.isActive });
    console.log(
      `[InstructorService] Instructor status toggled: ${id} (${current.data.isActive ? "active" : "inactive"} -> ${!current.data.isActive ? "active" : "inactive"})`
    );
    return updated;
  }

  // FIX: requiere organizationId, cache key scopeada
  async getInstructorStats(organizationId: string): Promise<
    ApiResponse<{ total: number; active: number; inactive: number; byRole: Record<string, number> }>
  > {
    const cacheKey = `instructor_stats:${organizationId}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return { success: true, data: cached, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
    }

    const stats = await this.repository.getInstructorStats(organizationId);
    setCached(cacheKey, stats, 5 * 60 * 1000);

    return { success: true, data: stats, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  // FIX: validación scopeada a organizationId (antes comparaba contra todos los centros)
  private async validateCreateData(data: any): Promise<void> {
    if (!data.firstName || data.firstName.trim().length === 0) {
      throw new ValidationError("First name is required", "firstName");
    }
    if (!data.lastName || data.lastName.trim().length === 0) {
      throw new ValidationError("Last name is required", "lastName");
    }
    if (!data.email || !data.email.includes("@")) {
      throw new ValidationError("Valid email is required", "email");
    }
    if (!data.organizationId) {
      throw new ValidationError("organizationId is required", "organizationId");
    }

    const duplicate = await prisma.instructor.findFirst({
      where: {
        organizationId: data.organizationId,
        email: data.email.toLowerCase(),
      },
    });
    if (duplicate) {
      throw new ValidationError("An instructor with this email already exists in this organization", "email");
    }
  }

  // FIX: validación scopeada a organizationId
  private async validateUpdateData(id: string, data: any, existingRecord: Instructor): Promise<void> {
    const updateSchema = generatedSchemas.instructor.partial();
    validateWithSchema(updateSchema, data);

    if (data.email && data.email !== existingRecord.email) {
      const duplicate = await prisma.instructor.findFirst({
        where: {
          organizationId: existingRecord.organizationId,
          email: data.email.toLowerCase(),
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ValidationError("An instructor with this email already exists in this organization", "email");
      }
    }
  }

  private async validateDelete(id: string): Promise<void> {
    const classesWithInstructor = await prisma.classSession.findMany({
      where: { instructorId: id },
    });
    if (classesWithInstructor.length > 0) {
      throw new ValidationError("Cannot delete instructor that is assigned to classes. Deactivate them instead.");
    }
  }
}

export const instructorService = new InstructorService();
