import { OrganizationRepository as IOrganizationRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { Organization } from "../../types";
import { prisma } from "../../prisma";

export class PrismaOrganizationRepository implements IOrganizationRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<Organization>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 10;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
        take: limit,
        skip,
        select: {
          id: true,
          name: true,
          settings: true,
        }
      }),
      this.prisma.organization.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: organizations.map((o: any) => this.mapToEntity(o)),
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

  async findUnique(params: FindUniqueParams): Promise<Organization | null> {
    if (!params.where || Object.keys(params.where).length === 0) {
      return null;
    }
    const organization = await this.prisma.organization.findUnique({
      where: params.where as any,
      select: {
        id: true,
        name: true,
        settings: true,
      }
    });
    return organization ? this.mapToEntity(organization) : null;
  }

  async findFirst(): Promise<Organization | null> {
    const result = await this.prisma.organization.findFirst({
      take: 1,
      select: {
        id: true,
        name: true,
        settings: true,
      }
    });
    return result ? this.mapToEntity(result) : null;
  }

  async create(data: CreateData<Organization>): Promise<Organization> {
    const created = await this.prisma.organization.create({
      data: {
        id: data.id,
        name: data.name,
        isActive: true,
        settings: {
          ...(data.settings as any || {}),
          description: data.description,
          type: data.type,
          branding: data.branding,
        },
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<Organization>): Promise<Organization> {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    const currentSettings = (existing?.settings as any) || {};

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        settings: {
          ...currentSettings,
          ...(data.settings as any || {}),
          description: data.description !== undefined ? data.description : currentSettings.description,
          type: data.type !== undefined ? data.type : currentSettings.type,
          branding: data.branding !== undefined ? data.branding : currentSettings.branding,
        },
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<Organization> {
    const deleted = await this.prisma.organization.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.organization.count({
      where: params?.where,
    });
  }

  async findByType(type: string): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        settings: true,
      }
    });
    return organizations
      .map((o: any) => this.mapToEntity(o))
      .filter(o => o.type === type);
  }

  // Mapper
  private mapToEntity(prismaOrg: any): Organization {
    const settings = (prismaOrg.settings as any) || {};

    // Tarea 2: Mantener settings solo con timezone, operatingHours, defaultCancellationHours
    const filteredSettings = {
      timezone: settings.timezone || "America/Santiago",
      operatingHours: settings.operatingHours || [],
      defaultCancellationHours: settings.defaultCancellationHours || 6,
    };

    return {
      id: prismaOrg.id,
      name: prismaOrg.name,
      description: settings.description || "",
      type: settings.type || "gym",
      branding: settings.branding || { primaryColor: "#3b82f6", secondaryColor: "#10b981" },
      settings: filteredSettings as any,
    };
  }
}
