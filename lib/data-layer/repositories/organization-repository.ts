import { OrganizationRepository as IOrganizationRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { Organization } from "../../types";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

// MT-10: columnas tipadas — ya no se lee desde el JSONB settings
type OrgRow = {
  id: string;
  name: string;
  description: string | null;
  orgType: string;
  timezone: string;
  operatingHours: Prisma.JsonValue;
  defaultCancellationHours: number;
  themePrimaryColor: string;
};

const ORG_SELECT = {
  id: true,
  name: true,
  description: true,
  orgType: true,
  timezone: true,
  operatingHours: true,
  defaultCancellationHours: true,
  themePrimaryColor: true,
} as const;

// DECISIÓN (MT-10, cierre): este repositorio expone solo los campos de
// configuración operativa del centro (timezone, horarios, branding visual,
// descripción). Los campos de gestión SaaS — slug, status, billingPlan,
// billingPeriodEnd, datos de contacto/dueño — viven fuera de este tipo
// `Organization` y se leen vía Prisma directo en /manager y en
// /api/organization/route.ts.
//
// Son dos vistas del mismo modelo Organization con propósitos distintos:
// esta es la vista "configuración del centro" (consumida por el contexto
// de tenant en requireAuth/operación diaria), la otra es la vista
// "administración SaaS" (consumida por /manager).
//
// Si en el futuro /manager necesita leer timezone/operatingHours, o el
// contexto de tenant necesita leer billingPlan/status, evaluar si conviene
// unificar en un solo tipo o mantener la separación. Por ahora la separación
// es intencional, no accidental.
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
        select: ORG_SELECT,
      }),
      this.prisma.organization.count({ where: params?.where }),
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
      },
    };
  }

  async findUnique(params: FindUniqueParams): Promise<Organization | null> {
    if (!params.where || Object.keys(params.where).length === 0) {
      return null;
    }
    const organization = await this.prisma.organization.findUnique({
      where: params.where as Prisma.OrganizationWhereUniqueInput,
      select: ORG_SELECT,
    });
    return organization ? this.mapToEntity(organization) : null;
  }

  async findFirst(): Promise<Organization | null> {
    const result = await this.prisma.organization.findFirst({
      take: 1,
      select: ORG_SELECT,
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
        description: data.description,
        orgType: data.type ?? "gym",
        timezone: data.settings?.timezone ?? "America/Santiago",
        operatingHours: data.settings?.operatingHours ?? [],
        defaultCancellationHours: data.settings?.defaultCancellationHours ?? 6,
        themePrimaryColor: data.branding?.primaryColor ?? "#6366f1",
      },
      select: ORG_SELECT,
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<Organization>): Promise<Organization> {
    // Prisma omite campos undefined automáticamente — no se necesita findUnique previo
    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        orgType: data.type,
        timezone: data.settings?.timezone,
        operatingHours: data.settings?.operatingHours,
        defaultCancellationHours: data.settings?.defaultCancellationHours,
        themePrimaryColor: data.branding?.primaryColor,
      },
      select: ORG_SELECT,
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<Organization> {
    const deleted = await this.prisma.organization.delete({
      where: { id },
      select: ORG_SELECT,
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.organization.count({
      where: params?.where,
    });
  }

  // MT-10: filtro en DB, no en JS (antes era full table scan en Node)
  async findByType(type: string): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: { orgType: type },
      select: ORG_SELECT,
    });
    return organizations.map((o) => this.mapToEntity(o));
  }

  // Mapper limpio — sin castings desde JSONB
  private mapToEntity(prismaOrg: OrgRow): Organization {
    return {
      id: prismaOrg.id,
      name: prismaOrg.name,
      description: prismaOrg.description ?? "",
      type: prismaOrg.orgType,
      branding: {
        primaryColor: prismaOrg.themePrimaryColor,
        secondaryColor: "#10b981", // themeVariant controla variantes, secondaryColor es fijo por ahora
      },
      settings: {
        timezone: prismaOrg.timezone,
        operatingHours: (prismaOrg.operatingHours as Organization["settings"]["operatingHours"]) ?? [],
        defaultCancellationHours: prismaOrg.defaultCancellationHours,
      },
    };
  }
}
