import { PlanRepository as IPlanRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { MembershipPlan } from "../../types";
import { ValidationError } from "../../errors/types";
import { prisma } from "../../prisma";

export class PrismaPlanRepository implements IPlanRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<MembershipPlan>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 10;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [plans, total] = await Promise.all([
      this.prisma.membershipPlan.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
        take: limit,
        skip,
      }),
      this.prisma.membershipPlan.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: plans.map((p: any) => this.mapToEntity(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  }

  async findUnique(params: FindUniqueParams): Promise<MembershipPlan | null> {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: params.where as any,
    });
    return plan ? this.mapToEntity(plan) : null;
  }

  async create(data: CreateData<MembershipPlan>): Promise<MembershipPlan> {
    const created = await this.prisma.membershipPlan.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.durationInMonths,
        isActive: data.isActive ?? true,
        config: {
          organizationId: data.organizationId,
          classLimit: data.classLimit,
          disciplineAccess: data.disciplineAccess,
          allowedDisciplines: data.allowedDisciplines,
          canFreeze: data.canFreeze,
          freezeDurationDays: data.freezeDurationDays,
          autoRenews: data.autoRenews,
        },
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<MembershipPlan>): Promise<MembershipPlan> {
    const existing = await this.prisma.membershipPlan.findUnique({ where: { id } });
    const currentConfig = (existing?.config as any) || {};

    const updated = await this.prisma.membershipPlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.durationInMonths,
        isActive: data.isActive,
        config: {
          ...currentConfig,
          organizationId: data.organizationId !== undefined ? data.organizationId : currentConfig.organizationId,
          classLimit: data.classLimit !== undefined ? data.classLimit : currentConfig.classLimit,
          disciplineAccess: data.disciplineAccess !== undefined ? data.disciplineAccess : currentConfig.disciplineAccess,
          allowedDisciplines: data.allowedDisciplines !== undefined ? data.allowedDisciplines : currentConfig.allowedDisciplines,
          canFreeze: data.canFreeze !== undefined ? data.canFreeze : currentConfig.canFreeze,
          freezeDurationDays: data.freezeDurationDays !== undefined ? data.freezeDurationDays : currentConfig.freezeDurationDays,
          autoRenews: data.autoRenews !== undefined ? data.autoRenews : currentConfig.autoRenews,
        },
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<MembershipPlan> {
    const deleted = await this.prisma.membershipPlan.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.membershipPlan.count({
      where: params?.where,
    });
  }

  async findActive(): Promise<MembershipPlan[]> {
    return this.findByStatus("active");
  }

  async findByStatus(status: string): Promise<MembershipPlan[]> {
    const plans = await this.prisma.membershipPlan.findMany({
      where: {
        isActive: status === "active"
      }
    });
    return plans.map(p => this.mapToEntity(p));
  }

  async findByOrganization(organizationId: string): Promise<MembershipPlan[]> {
    const plans = await this.prisma.membershipPlan.findMany();
    return plans
      .map(p => this.mapToEntity(p))
      .filter(p => p.organizationId === organizationId);
  }

  async getPlanStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    averagePrice: number;
    mostPopular: string | null;
  }> {
    const [total, active, allPlans] = await Promise.all([
      this.prisma.membershipPlan.count(),
      this.prisma.membershipPlan.count({ where: { isActive: true } }),
      this.prisma.membershipPlan.findMany(),
    ]);

    const mappedPlans = allPlans.map(p => this.mapToEntity(p));
    const averagePrice = total > 0 
      ? mappedPlans.reduce((sum, p) => sum + p.price, 0) / total 
      : 0;

    return {
      total,
      active,
      inactive: total - active,
      averagePrice: Math.round(averagePrice),
      mostPopular: mappedPlans[0]?.name || null, // Simplified for now
    };
  }

  private mapToEntity(p: any): MembershipPlan {
    const config = (p.config as any) || {};
    return {
      id: p.id,
      organizationId: config.organizationId || "org_blacksheep_001",
      name: p.name,
      description: p.description || "",
      price: p.price,
      durationInMonths: p.duration,
      classLimit: config.classLimit || 0,
      disciplineAccess: config.disciplineAccess || "all",
      allowedDisciplines: config.allowedDisciplines || [],
      canFreeze: config.canFreeze || false,
      freezeDurationDays: config.freezeDurationDays || 0,
      autoRenews: config.autoRenews || false,
      isActive: p.isActive,
    };
  }
}
