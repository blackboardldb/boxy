// lib/services/organization-service.ts
// Migrado (Bloque 1 — Prisma Provider): ya no extiende BaseService ni pasa
// por PrismaOrganizationRepository. Prisma directo.
//
// getOrganization() (findFirst sin scope) fue eliminado — confirmado código
// muerto, sin callers en toda la app.
//
// MT-10: se mantiene la separación intencional de "vista config del centro"
// (este service, campos operativos) vs "vista admin SaaS" (leída directo
// con Prisma en /manager y en GET de esta misma ruta). Ver comentario
// original en organization-repository.ts para el razonamiento completo.

import { prisma } from "../prisma";
import { Organization } from "../types";
import { ApiResponse, createSuccessResponse } from "../api/types";
import { NotFoundError } from "../errors/types";
import { withErrorHandling } from "../errors/handler";

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

type OrgRow = {
  id: string;
  name: string;
  description: string | null;
  orgType: string;
  timezone: string;
  operatingHours: unknown;
  defaultCancellationHours: number;
  themePrimaryColor: string;
};

function mapToEntity(row: OrgRow): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    type: row.orgType,
    branding: {
      primaryColor: row.themePrimaryColor,
      secondaryColor: "#10b981",
    },
    settings: {
      timezone: row.timezone,
      operatingHours: (row.operatingHours as Organization["settings"]["operatingHours"]) ?? [],
      defaultCancellationHours: row.defaultCancellationHours,
    },
  };
}

export class OrganizationService {
  async update(id: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return withErrorHandling(async () => {
      const existing = await prisma.organization.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError("organizations", id);

      const updated = await prisma.organization.update({
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

      return createSuccessResponse(mapToEntity(updated));
    }, { operation: "updateOrganization", resource: "organizations", metadata: { id } });
  }
}

export const organizationService = new OrganizationService();
