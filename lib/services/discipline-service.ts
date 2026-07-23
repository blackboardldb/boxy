// lib/services/discipline-service.ts
// Migrado (Bloque 1 — Prisma Provider): ya no extiende BaseService ni pasa
// por PrismaDisciplineRepository. Prisma directo.
//
// FIX incluido: generateClassesFromSchedules() se llamaba con
// (updatedRecord as any).organizationId, que siempre era undefined porque
// mapToEntity() nunca incluía ese campo. Ahora se captura organizationId
// directo de la fila cruda de Prisma antes de mapear.
//
// organizationId ahora es obligatorio en getDisciplines / getActiveDisciplines
// / getDisciplineStats (antes sin scope — mismo patrón que BUG-06).

import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { Discipline } from "../types";
import { ApiResponse, PaginatedApiResponse, createSuccessResponse, createPaginatedResponse } from "../api/types";
import { ValidationError, NotFoundError } from "../errors/types";
import { withErrorHandling } from "../errors/handler";
import { createSchemas, generatedSchemas, validateWithSchema } from "../types/generator";
import { generateClassesFromSchedules } from "../utils/class-generator";

type DisciplineRow = Prisma.DisciplineGetPayload<Record<string, never>>;

// Igual que en el repository original: defaultCoachId vive dentro del JSON
// de cancellationRules para evitar una migración de columna.
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

function buildPayload(rules: Discipline["cancellationRules"], defaultCoachId?: string): Prisma.InputJsonValue {
  return { rules, defaultCoachId: defaultCoachId ?? null } as unknown as Prisma.InputJsonValue;
}

function mapToEntity(d: DisciplineRow): Discipline {
  return {
    id: d.id,
    name: d.name,
    description: d.description || undefined,
    color: d.color,
    isActive: d.isActive,
    schedule: Array.isArray(d.schedule) ? (d.schedule as unknown as Discipline["schedule"]) : [],
    cancellationRules: extractRules(d.cancellationRules),
    defaultCoachId: extractDefaultCoachId(d.cancellationRules),
    capacity: d.capacity,
    durationMinutes: d.durationMinutes,
  };
}

// ─── Cache local (mismo caveat de siempre: no persiste entre workers) ──────
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

async function withCache<R>(key: string, operation: () => Promise<R>, ttlMs = 5 * 60 * 1000): Promise<R> {
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < cached.ttl) return cached.data as R;
  const result = await operation();
  cache.set(key, { data: result, timestamp: now, ttl: ttlMs });
  return result;
}

function clearCache() {
  cache.clear();
}

export class DisciplineService {
  async getDisciplines(params: {
    organizationId: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedApiResponse<Discipline>> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { organizationId: params.organizationId };
    if (params.isActive !== undefined) where.isActive = params.isActive;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [disciplines, total] = await Promise.all([
      prisma.discipline.findMany({ where, take: limit, skip }),
      prisma.discipline.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return createPaginatedResponse(disciplines.map(mapToEntity), {
      page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1,
    });
  }

  async getDisciplineById(id: string): Promise<ApiResponse<Discipline | null>> {
    const row = await prisma.discipline.findUnique({ where: { id } });
    return createSuccessResponse(row ? mapToEntity(row) : null);
  }

  async getActiveDisciplines(organizationId: string): Promise<ApiResponse<Discipline[]>> {
    return withCache(`active_disciplines_${organizationId}`, async () => {
      const rows = await prisma.discipline.findMany({
        where: { organizationId, isActive: true },
        take: 1000,
      });
      return createSuccessResponse(rows.map(mapToEntity));
    }, 10 * 60 * 1000);
  }

  async createDiscipline(data: any): Promise<ApiResponse<Discipline>> {
    return withErrorHandling(async () => {
      await validateCreateData(data);
      const orgId = data.organizationId;
      if (!orgId) throw new ValidationError("organizationId is required");

      const created = await prisma.discipline.create({
        data: {
          id: data.id,
          organizationId: orgId,
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

      clearCache();
      console.log(`[DisciplineService] Discipline created: ${created.id} (${created.name})`);
      return createSuccessResponse(mapToEntity(created));
    }, { operation: "createDiscipline", resource: "disciplines" });
  }

  async updateDiscipline(id: string, data: any): Promise<ApiResponse<Discipline>> {
    return withErrorHandling(async () => {
      const previous = await prisma.discipline.findUnique({ where: { id } });
      if (!previous) throw new NotFoundError("disciplines", id);

      const previousEntity = mapToEntity(previous);
      await validateUpdateData(id, data, previousEntity);

      const existingRules = extractRules(previous.cancellationRules);
      const existingCoachId = extractDefaultCoachId(previous.cancellationRules);
      const newRules = data.cancellationRules !== undefined ? data.cancellationRules : existingRules;
      const newCoachId = data.defaultCoachId !== undefined ? data.defaultCoachId : existingCoachId;

      const updatedRow = await prisma.discipline.update({
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

      const updatedEntity = mapToEntity(updatedRow);
      clearCache();

      if (previousEntity.isActive !== updatedEntity.isActive) {
        console.log(`[DisciplineService] Discipline status changed: ${updatedEntity.id} (${previousEntity.isActive ? "active" : "inactive"} -> ${updatedEntity.isActive ? "active" : "inactive"})`);
      }

      const deactivated = previousEntity.isActive && !updatedEntity.isActive;
      const activated = !previousEntity.isActive && updatedEntity.isActive;
      const scheduleChanged = JSON.stringify(previousEntity.schedule) !== JSON.stringify(updatedEntity.schedule);

      if (scheduleChanged || deactivated || activated) {
        let triggerReason = deactivated ? "DESACTIVACIÓN" : "CAMBIO DE HORARIO";
        if (activated && !scheduleChanged) triggerReason = "ACTIVACIÓN";
        console.log(`[DisciplineService] Iniciando limpieza por ${triggerReason} para: ${updatedEntity.name}.`);

        try {
          const now = new Date();
          const deleteResult = await prisma.classSession.deleteMany({
            where: {
              disciplineId: updatedEntity.id,
              dateTime: { gte: now },
              registrations: { none: { status: "registered" } },
            },
          });
          console.log(`[DisciplineService] Limpieza completada: se eliminaron ${deleteResult.count} clases futuras sin alumnos.`);

          if ((scheduleChanged || activated) && updatedEntity.isActive) {
            console.log("[DisciplineService] Re-generando clases con el nuevo patrón (Ventana 15 días)...");
            // FIX: organizationId real (updatedRow.organizationId), antes era
            // (updatedRecord as any).organizationId → siempre undefined.
            await generateClassesFromSchedules(updatedRow.organizationId, undefined, undefined, updatedEntity.id);
            console.log("[DisciplineService] Re-generación completada.");
          } else if (deactivated) {
            console.log("[DisciplineService] Disciplina inactiva: las clases futuras CON alumnos permanecen para gestión manual.");
          }
        } catch (e) {
          console.error("[DisciplineService] Error en sincronización/limpieza de disciplina:", e);
        }
      }

      return createSuccessResponse(updatedEntity);
    }, { operation: "updateDiscipline", resource: "disciplines", metadata: { id } });
  }

  async deleteDiscipline(id: string): Promise<ApiResponse<Discipline>> {
    return withErrorHandling(async () => {
      const existing = await prisma.discipline.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError("disciplines", id);

      const classesUsingDiscipline = await prisma.classSession.count({ where: { disciplineId: id } });
      if (classesUsingDiscipline > 0) {
        throw new ValidationError("Cannot delete discipline that is being used by classes. Deactivate it instead.");
      }

      const deletedRow = await prisma.discipline.delete({ where: { id } });
      const deletedEntity = mapToEntity(deletedRow);
      clearCache();
      console.log(`[DisciplineService] Discipline deleted: ${deletedEntity.id} (${deletedEntity.name})`);

      // Limpieza de especialidades huérfanas en instructores
      try {
        const affectedInstructors = await prisma.instructor.findMany({});
        const toUpdate = affectedInstructors.filter((inst) => {
          const profile = (inst.profile as { specialties?: string[] }) || {};
          return Array.isArray(profile.specialties) && profile.specialties.includes(deletedEntity.id);
        });

        await Promise.all(
          toUpdate.map((inst) => {
            const profile = (inst.profile as { specialties?: string[]; userId?: string }) || {};
            const filtered = (profile.specialties ?? []).filter((sid) => sid !== deletedEntity.id);
            return prisma.instructor.update({
              where: { id: inst.id },
              data: { profile: { ...profile, specialties: filtered } },
            });
          })
        );

        if (toUpdate.length > 0) {
          console.log(`[DisciplineService] Cleaned orphaned specialties from ${toUpdate.length} instructor(s).`);
        }
      } catch (e) {
        console.error("[DisciplineService] Error cleaning instructor specialties:", e);
      }

      return createSuccessResponse(deletedEntity);
    }, { operation: "deleteDiscipline", resource: "disciplines", metadata: { id } });
  }

  async getDisciplineStats(organizationId: string): Promise<ApiResponse<{
    total: number; active: number; inactive: number; mostPopular: string | null;
  }>> {
    return withCache(`discipline_stats_${organizationId}`, async () => {
      const items = await prisma.discipline.findMany({ where: { organizationId }, take: 1000 });
      const stats = {
        total: items.length,
        active: items.filter((d) => d.isActive).length,
        inactive: items.filter((d) => !d.isActive).length,
        mostPopular: null as string | null,
      };
      return createSuccessResponse(stats);
    }, 5 * 60 * 1000);
  }
}

async function validateCreateData(data: any): Promise<void> {
  validateWithSchema(createSchemas.discipline, data);
  if (!data.name || data.name.trim().length === 0) {
    throw new ValidationError("Discipline name is required", "name");
  }
  // Scoped a la misma organización — antes chequeaba nombres duplicados cross-tenant.
  const existing = await prisma.discipline.findFirst({
    where: { name: { equals: data.name.trim(), mode: "insensitive" }, organizationId: data.organizationId },
  });
  if (existing) {
    throw new ValidationError("A discipline with this name already exists", "name");
  }
}

async function validateUpdateData(id: string, data: any, existingRecord: Discipline & { organizationId?: string }): Promise<void> {
  const updateSchema = generatedSchemas.discipline.partial();
  validateWithSchema(updateSchema, data);

  if (data.name && data.name !== existingRecord.name) {
    const current = await prisma.discipline.findUnique({ where: { id } });
    const duplicate = await prisma.discipline.findFirst({
      where: {
        id: { not: id },
        organizationId: current?.organizationId,
        name: { equals: data.name, mode: "insensitive" },
      },
    });
    if (duplicate) throw new ValidationError("A discipline with this name already exists", "name");
  }
}

export const disciplineService = new DisciplineService();
