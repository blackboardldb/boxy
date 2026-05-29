import { DisciplineRepository as IDisciplineRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { Discipline } from "../../types";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

type DisciplineRow = Prisma.DisciplineGetPayload<Record<string, never>>;

// We store defaultCoachId inside the cancellationRules JSON column to avoid a
// DB migration. Format: { rules: [...], defaultCoachId?: string | null }
// Legacy rows with a plain array are handled safely.

function extractRules(payload: unknown): Discipline["cancellationRules"] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as Discipline["cancellationRules"];
  const p = payload as { rules?: unknown };
  return Array.isArray(p.rules) ? (p.rules as Discipline["cancellationRules"]) : [];
}

function extractDefaultCoachId(payload: unknown): string | undefined {
  if (!payload || Array.isArray(payload)) return undefined;
  const p = payload as { defaultCoachId?: string | null };
  return p.defaultCoachId || undefined;
}

function buildPayload(
  rules: Discipline["cancellationRules"],
  defaultCoachId?: string
): Prisma.InputJsonValue {
  return { rules, defaultCoachId: defaultCoachId ?? null } as unknown as Prisma.InputJsonValue;
}

export class PrismaDisciplineRepository implements IDisciplineRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<Discipline>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 50;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [disciplines, total] = await Promise.all([
      this.prisma.discipline.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
        take: limit,
        skip,
      }),
      this.prisma.discipline.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: disciplines.map((d) => this.mapToEntity(d)),
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

  async findUnique(params: FindUniqueParams): Promise<Discipline | null> {
    const discipline = await this.prisma.discipline.findUnique({
      where: params.where as Prisma.DisciplineWhereUniqueInput,
    });
    return discipline ? this.mapToEntity(discipline) : null;
  }

  async create(data: CreateData<Discipline>): Promise<Discipline> {
    const created = await this.prisma.discipline.create({
      data: {
        id: data.id,
        organizationId: (data as { organizationId?: string }).organizationId || "org_blacksheep_001",
        name: data.name,
        description: data.description,
        color: data.color || "#3b82f6",
        isActive: data.isActive ?? true,
        schedule: (data.schedule as unknown as Prisma.InputJsonValue) ?? [],
        cancellationRules: buildPayload(data.cancellationRules ?? [], data.defaultCoachId),
        capacity: data.capacity,
        durationMinutes: data.durationMinutes,
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<Discipline>): Promise<Discipline> {
    // Fetch existing to merge unset fields correctly
    const existing = await this.prisma.discipline.findUnique({ where: { id } });
    const existingRules = extractRules(existing?.cancellationRules);
    const existingCoachId = extractDefaultCoachId(existing?.cancellationRules);

    const newRules = data.cancellationRules !== undefined ? data.cancellationRules : existingRules;
    const newCoachId = data.defaultCoachId !== undefined ? data.defaultCoachId : existingCoachId;

    const updated = await this.prisma.discipline.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        isActive: data.isActive,
        schedule: data.schedule ? (data.schedule as unknown as Prisma.InputJsonValue) : undefined,
        cancellationRules: buildPayload(newRules, newCoachId),
        capacity: data.capacity,
        durationMinutes: data.durationMinutes,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<Discipline> {
    const deleted = await this.prisma.discipline.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.discipline.count({
      where: params?.where,
    });
  }

  async findActive(): Promise<Discipline[]> {
    const active = await this.prisma.discipline.findMany({
      where: { isActive: true },
    });
    return active.map((d) => this.mapToEntity(d));
  }

  async findByName(name: string): Promise<Discipline | null> {
    const discipline = await this.prisma.discipline.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return discipline ? this.mapToEntity(discipline) : null;
  }

  private mapToEntity(d: DisciplineRow): Discipline {
    return {
      id: d.id,
      name: d.name,
      description: d.description || undefined,
      color: d.color,
      isActive: d.isActive,
      schedule: Array.isArray(d.schedule) ? d.schedule as unknown as Discipline["schedule"] : [],
      cancellationRules: extractRules(d.cancellationRules),
      defaultCoachId: extractDefaultCoachId(d.cancellationRules),
      capacity: d.capacity,
      durationMinutes: d.durationMinutes,
    };
  }
}
