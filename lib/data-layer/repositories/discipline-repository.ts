import { DisciplineRepository as IDisciplineRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { Discipline } from "../../types";
import { prisma } from "../../prisma";

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
      items: disciplines.map((d: any) => this.mapToEntity(d)),
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
      where: params.where as any,
    });
    return discipline ? this.mapToEntity(discipline) : null;
  }

  async create(data: CreateData<Discipline>): Promise<Discipline> {
    const created = await this.prisma.discipline.create({
      data: {
        id: data.id,
        organizationId: (data as any).organizationId || "org_blacksheep_001",
        name: data.name,
        description: data.description,
        color: data.color || "#3b82f6",
        isActive: data.isActive ?? true,
        schedule: (data.schedule as any) || [],
        cancellationRules: (data.cancellationRules as any) || [],
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<Discipline>): Promise<Discipline> {
    const updated = await this.prisma.discipline.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        isActive: data.isActive,
        schedule: data.schedule ? (data.schedule as any) : undefined,
        cancellationRules: data.cancellationRules ? (data.cancellationRules as any) : undefined,
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
    return active.map((d: any) => this.mapToEntity(d));
  }

  async findByName(name: string): Promise<Discipline | null> {
    const discipline = await this.prisma.discipline.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return discipline ? this.mapToEntity(discipline) : null;
  }

  // Mapper
  private mapToEntity(prismaDiscipline: any): Discipline {
    return {
      id: prismaDiscipline.id,
      name: prismaDiscipline.name,
      description: prismaDiscipline.description || undefined,
      color: prismaDiscipline.color,
      isActive: prismaDiscipline.isActive,
      schedule: Array.isArray(prismaDiscipline.schedule) ? prismaDiscipline.schedule : [],
      cancellationRules: Array.isArray(prismaDiscipline.cancellationRules) ? prismaDiscipline.cancellationRules : [],
    } as Discipline;
  }
}
