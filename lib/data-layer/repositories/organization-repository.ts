import { OrganizationRepository as IOrganizationRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { Organization } from "../../types";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

type OrgRow = { id: string; name: string; settings: Prisma.JsonValue };

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
      items: organizations.map((o) => this.mapToEntity(o)),
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
      where: params.where as Prisma.OrganizationWhereUniqueInput,
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
    const generatedSlug = data.name
      ? data.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : "centro-" + Math.floor(Math.random() * 1000000);

    const created = await this.prisma.organization.create({
      data: {
        id: data.id,
        name: data.name,
        slug: generatedSlug,
        isActive: true,
        settings: {
          ...(data.settings as Record<string, unknown> || {}),
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
    const currentSettings = (existing?.settings as Record<string, unknown>) || {};

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        settings: {
          ...currentSettings,
          ...(data.settings as Record<string, unknown> || {}),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.branding !== undefined && { branding: data.branding }),
        } as Prisma.InputJsonValue,
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
      .map((o) => this.mapToEntity(o))
      .filter(o => o.type === type);
  }

  // Mapper
  private mapToEntity(prismaOrg: OrgRow): Organization {
    const settings = (prismaOrg.settings as Record<string, unknown>) || {};

    // Tarea 2: Mantener settings solo con timezone, operatingHours, defaultCancellationHours
    const filteredSettings = {
      timezone: settings.timezone || "America/Santiago",
      operatingHours: settings.operatingHours || [],
      defaultCancellationHours: settings.defaultCancellationHours || 6,
    };

    return {
      id: prismaOrg.id,
      name: prismaOrg.name,
      description: (settings.description as string) || "",
      type: (settings.type as string) || "gym",
      branding: (settings.branding as Organization["branding"]) || { primaryColor: "#3b82f6", secondaryColor: "#10b981" },
      settings: filteredSettings as Organization["settings"],
    };
  }
}
