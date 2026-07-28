import { prisma } from "../prisma";
import { MembershipPlan } from "../types";
import { ApiResponse, PaginatedApiResponse } from "../api/types";
import { generatedSchemas, createSchemas, validateWithSchema } from "../types/generator";
import { ValidationError, NotFoundError } from "../errors/types";
import { PrismaPlanRepository } from "../data-layer/repositories/plan-repository";
import { Prisma } from "@prisma/client";

type PlanConfig = { classLimit?: number; disciplineAccess?: string; allowedDisciplines?: string[]; canFreeze?: boolean; freezeDurationDays?: number; autoRenews?: boolean };

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

function mapToEntity(p: any): MembershipPlan {
  const config = (p.config as PlanConfig) || {};
  return {
    id: p.id,
    organizationId: p.organizationId,
    name: p.name,
    description: p.description || "",
    price: p.price,
    durationInMonths: p.duration,
    classLimit: config.classLimit || 0,
    disciplineAccess: (config.disciplineAccess as "all" | "limited") || "all",
    allowedDisciplines: config.allowedDisciplines || [],
    canFreeze: config.canFreeze || false,
    freezeDurationDays: config.freezeDurationDays || 0,
    autoRenews: config.autoRenews || false,
    isActive: p.isActive,
  };
}

export class PlanService {
  private repository = new PrismaPlanRepository();

  async getPlans(params: {
    page?: number;
    limit?: number;
    organizationId: string; // ahora obligatorio
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedApiResponse<MembershipPlan>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MembershipPlanWhereInput = {
      organizationId: params.organizationId,
    };

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [plans, total] = await Promise.all([
      prisma.membershipPlan.findMany({ where, take: limit, skip }),
      prisma.membershipPlan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: plans.map(mapToEntity),
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

  async getPlanById(id: string): Promise<ApiResponse<MembershipPlan | null>> {
    const plan = await prisma.membershipPlan.findUnique({ where: { id } });
    return {
      success: true,
      data: plan ? mapToEntity(plan) : null,
      meta: { timestamp: new Date().toISOString(), processingTime: 0 },
    };
  }

  // FIX: requiere organizationId, cache key scopeada
  async getActivePlans(organizationId: string): Promise<ApiResponse<MembershipPlan[]>> {
    const cacheKey = `active_plans:${organizationId}`;
    const cached = getCached<MembershipPlan[]>(cacheKey);
    if (cached) {
      return { success: true, data: cached, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
    }

    const plans = await this.repository.findByStatus("active", organizationId);
    setCached(cacheKey, plans, 10 * 60 * 1000);

    return { success: true, data: plans, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  async createPlan(planData: any): Promise<ApiResponse<MembershipPlan>> {
    await this.validateCreateData(planData);

    const created = await prisma.membershipPlan.create({
      data: {
        organizationId: planData.organizationId,
        name: planData.name,
        description: planData.description,
        price: planData.price,
        duration: planData.durationInMonths,
        isActive: planData.isActive ?? true,
        config: {
          classLimit: planData.classLimit,
          disciplineAccess: planData.disciplineAccess,
          allowedDisciplines: planData.allowedDisciplines,
          canFreeze: planData.canFreeze,
          freezeDurationDays: planData.freezeDurationDays,
          autoRenews: planData.autoRenews,
        },
      },
    });

    clearCache();
    console.log(`[PlanService] Plan created: ${created.id} (${created.name} - $${created.price})`);

    return { success: true, data: mapToEntity(created), meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  async updatePlan(id: string, planData: any, organizationId: string): Promise<ApiResponse<MembershipPlan>> {
    // findFirst con organizationId: el NotFoundError es intencionalmente
    // indistinguible entre "no existe" y "existe pero pertenece a otro tenant".
    const existing = await prisma.membershipPlan.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundError("plans", id);
    const existingEntity = mapToEntity(existing);

    await this.validateUpdateData(id, planData, existingEntity);

    const currentConfig = (existing.config as PlanConfig) || {};
    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: {
        name: planData.name,
        description: planData.description,
        price: planData.price,
        duration: planData.durationInMonths,
        isActive: planData.isActive,
        config: {
          ...currentConfig,
          classLimit: planData.classLimit !== undefined ? planData.classLimit : currentConfig.classLimit,
          disciplineAccess: planData.disciplineAccess !== undefined ? planData.disciplineAccess : currentConfig.disciplineAccess,
          allowedDisciplines: planData.allowedDisciplines !== undefined ? planData.allowedDisciplines : currentConfig.allowedDisciplines,
          canFreeze: planData.canFreeze !== undefined ? planData.canFreeze : currentConfig.canFreeze,
          freezeDurationDays: planData.freezeDurationDays !== undefined ? planData.freezeDurationDays : currentConfig.freezeDurationDays,
          autoRenews: planData.autoRenews !== undefined ? planData.autoRenews : currentConfig.autoRenews,
        },
      },
    });

    clearCache();
    if (existingEntity.isActive !== updated.isActive) {
      console.log(
        `[PlanService] Plan status changed: ${updated.id} (${existingEntity.isActive ? "active" : "inactive"} -> ${updated.isActive ? "active" : "inactive"})`
      );
    }
    if (existingEntity.price !== updated.price) {
      console.log(`[PlanService] Plan price changed: ${updated.id} ($${existingEntity.price} -> $${updated.price})`);
    }

    return { success: true, data: mapToEntity(updated), meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  async deletePlan(id: string, organizationId: string): Promise<ApiResponse<MembershipPlan>> {
    const existing = await prisma.membershipPlan.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundError("plans", id);
    await this.validateDelete(id);

    const deleted = await prisma.membershipPlan.delete({ where: { id } });
    clearCache();
    console.log(`[PlanService] Plan deleted: ${deleted.id} (${deleted.name})`);

    return { success: true, data: mapToEntity(deleted), meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  // FIX: requiere organizationId, cache key scopeada
  async getPlanStats(organizationId: string): Promise<
    ApiResponse<{ total: number; active: number; inactive: number; averagePrice: number; mostPopular: string | null }>
  > {
    const cacheKey = `plan_stats:${organizationId}`;
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return { success: true, data: cached, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
    }

    const stats = await this.repository.getPlanStats(organizationId);
    setCached(cacheKey, stats, 5 * 60 * 1000);

    return { success: true, data: stats, meta: { timestamp: new Date().toISOString(), processingTime: 0 } };
  }

  private async validateCreateData(data: any): Promise<void> {
    const createSchema = createSchemas.membershipPlan;
    validateWithSchema(createSchema, data);

    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Plan name is required", "name");
    }
    if (!data.price || data.price <= 0) {
      throw new ValidationError("Plan price must be greater than 0", "price");
    }
    if (!data.organizationId) {
      throw new ValidationError("organizationId is required to create a plan", "organizationId");
    }

    const duplicate = await prisma.membershipPlan.findFirst({
      where: {
        organizationId: data.organizationId,
        name: { equals: data.name, mode: "insensitive" },
      },
    });
    if (duplicate) {
      throw new ValidationError("A plan with this name already exists in this organization", "name");
    }
  }

  private async validateUpdateData(id: string, data: any, existingRecord: MembershipPlan): Promise<void> {
    const updateSchema = generatedSchemas.membershipPlan.partial();
    validateWithSchema(updateSchema, data);

    if (data.name && data.name !== existingRecord.name) {
      const duplicate = await prisma.membershipPlan.findFirst({
        where: {
          organizationId: existingRecord.organizationId,
          name: { equals: data.name, mode: "insensitive" },
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ValidationError("A plan with this name already exists in this organization", "name");
      }
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new ValidationError("Plan price must be greater than 0", "price");
    }
  }

  // FIX: usa la relación real planId en UserMembership en vez de comparar
  // por membershipType (string, no confiable entre centros ni ante rename).
  private async validateDelete(id: string): Promise<void> {
    const usersWithPlan = await prisma.userMembership.count({
      where: { planId: id },
    });

    if (usersWithPlan > 0) {
      throw new ValidationError(
        "Cannot delete plan that is being used by users. Deactivate it instead."
      );
    }
  }
}

export const planService = new PlanService();
