// lib/services/discipline-service.ts
// Migrado (Bloque 1 — Prisma Provider): ya no extiende BaseService ni pasa
// por PrismaDisciplineRepository. Prisma directo.
// Se incluye organizationId obligatorio en cache keys y queries.

import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { Discipline } from "../types";
import { ApiResponse, PaginatedApiResponse, createSuccessResponse, createPaginatedResponse } from "../api/types";
import { generatedSchemas, createSchemas, validateWithSchema } from "../types/generator";
import { ValidationError, NotFoundError } from "../errors/types";
import { withErrorHandling } from "../errors/handler";
import { generateClassesFromSchedules } from "../utils/class-generator";

type DisciplineRow = Prisma.DisciplineGetPayload<Record<string, never>>;

// ─── Helpers de JSON (portados de discipline-repository.ts) ─────────────

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

// ─── Cache en memoria ───────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

async function withCache<R>(key: string, operation: () => Promise<R>, ttlMs = 5 * 60 * 1000): Promise<R> {
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < cached.ttl) return cached.data as R;
  const result = await operation();
  cache.set(key, { data: result, timestamp: now, ttl: ttlMs });
  return result;
}

function clearCache(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}

// ─── Servicio ───────────────────────────────────────────────────────────

export class DisciplineService {
  async getDisciplines(
    organizationId: string,
    params?: { page?: number; limit?: number; isActive?: boolean; search?: string }
  ): Promise<PaginatedApiResponse<Discipline>> {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.search) {
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
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  }

  async getDisciplineById(id: string): Promise<ApiResponse<Discipline | null>> {
    return withErrorHandling(async () => {
      const discipline = await prisma.discipline.findUnique({ where: { id } });
      return createSuccessResponse(discipline ? mapToEntity(discipline) : null);
    }, { operation: "getDisciplineById", resource: "disciplines", metadata: { id } });
  }

  async getActiveDisciplines(organizationId: string): Promise<ApiResponse<Discipline[]>> {
    return withCache(`active_disciplines_${organizationId}`, async () => {
      const active = await prisma.discipline.findMany({
        where: { isActive: true, organizationId },
        take: 1000,
      });
      return createSuccessResponse(active.map(mapToEntity));
    }, 10 * 60 * 1000); // 10 mins
  }

  async createDiscipline(disciplineData: any): Promise<ApiResponse<Discipline>> {
    return withErrorHandling(async () => {
      await this.validateCreateData(disciplineData);
      const orgId = disciplineData.organizationId;
      if (!orgId) throw new ValidationError("organizationId is required");

      const created = await prisma.discipline.create({
        data: {
          id: disciplineData.id,
          organizationId: orgId,
          name: disciplineData.name,
          description: disciplineData.description,
          color: disciplineData.color || "#3b82f6",
          isActive: disciplineData.isActive ?? true,
          schedule: (disciplineData.schedule as any) ?? [],
          cancellationRules: buildPayload(disciplineData.cancellationRules ?? [], disciplineData.defaultCoachId),
          capacity: disciplineData.capacity,
          durationMinutes: disciplineData.durationMinutes,
        },
      });

      const record = mapToEntity(created);
      await this.afterCreate(record);
      return createSuccessResponse(record);
    }, { operation: "createDiscipline", resource: "disciplines" });
  }

  async updateDiscipline(id: string, disciplineData: any): Promise<ApiResponse<Discipline>> {
    return withErrorHandling(async () => {
      const existingRow = await prisma.discipline.findUnique({ where: { id } });
      if (!existingRow) throw new NotFoundError("disciplines", id);

      const existingRecord = mapToEntity(existingRow);
      await this.validateUpdateData(id, disciplineData, existingRecord, existingRow.organizationId);

      const existingRules = extractRules(existingRow.cancellationRules);
      const existingCoachId = extractDefaultCoachId(existingRow.cancellationRules);

      const newRules = disciplineData.cancellationRules !== undefined ? disciplineData.cancellationRules : existingRules;
      const newCoachId = disciplineData.defaultCoachId !== undefined ? disciplineData.defaultCoachId : existingCoachId;

      const updated = await prisma.discipline.update({
        where: { id },
        data: {
          name: disciplineData.name,
          description: disciplineData.description,
          color: disciplineData.color,
          isActive: disciplineData.isActive,
          schedule: disciplineData.schedule ? (disciplineData.schedule as any) : undefined,
          cancellationRules: buildPayload(newRules, newCoachId),
          capacity: disciplineData.capacity,
          durationMinutes: disciplineData.durationMinutes,
        },
      });

      const updatedRecord = mapToEntity(updated);
      await this.afterUpdate(existingRow.organizationId, updatedRecord, existingRecord);
      return createSuccessResponse(updatedRecord);
    }, { operation: "updateDiscipline", resource: "disciplines", metadata: { id } });
  }

  async deleteDiscipline(id: string): Promise<ApiResponse<Discipline>> {
    return withErrorHandling(async () => {
      const existingRow = await prisma.discipline.findUnique({ where: { id } });
      if (!existingRow) throw new NotFoundError("disciplines", id);
      
      const existingRecord = mapToEntity(existingRow);
      await this.validateDelete(id);

      const deleted = await prisma.discipline.delete({ where: { id } });
      const deletedRecord = mapToEntity(deleted);

      await this.afterDelete(deletedRecord);
      return createSuccessResponse(deletedRecord);
    }, { operation: "deleteDiscipline", resource: "disciplines", metadata: { id } });
  }

  async getDisciplineStats(organizationId: string): Promise<ApiResponse<{ total: number; active: number; inactive: number; mostPopular: string | null; }>> {
    return withCache(`discipline_stats_${organizationId}`, async () => {
      const allDisciplines = await prisma.discipline.findMany({ where: { organizationId }, take: 1000 });
      const stats = {
        total: allDisciplines.length,
        active: allDisciplines.filter(d => d.isActive).length,
        inactive: allDisciplines.filter(d => !d.isActive).length,
        mostPopular: null
      };
      return createSuccessResponse(stats);
    }, 5 * 60 * 1000);
  }

  // ─── Lifecycle & Validation Hooks ─────────────────────────────────────────

  private async validateCreateData(data: any): Promise<void> {
    console.log("[DisciplineService] validateCreateData received:", JSON.stringify(data));
    validateWithSchema(createSchemas.discipline, data);

    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Discipline name is required", "name");
    }

    const existing = await prisma.discipline.findFirst({
      where: { 
        name: { equals: data.name.trim(), mode: 'insensitive' },
        organizationId: data.organizationId 
      }
    });
    if (existing) {
      throw new ValidationError("A discipline with this name already exists", "name");
    }
  }

  private async validateUpdateData(id: string, data: any, existingRecord: Discipline, orgId: string): Promise<void> {
    const updateSchema = generatedSchemas.discipline.partial();
    validateWithSchema(updateSchema, data);

    if (data.name && data.name !== existingRecord.name) {
      const duplicateName = await prisma.discipline.findFirst({
        where: {
          id: { not: id },
          organizationId: orgId,
          name: { equals: data.name.trim(), mode: 'insensitive' }
        }
      });
      if (duplicateName) {
        throw new ValidationError("A discipline with this name already exists", "name");
      }
    }
  }

  private async validateDelete(id: string): Promise<void> {
    const classesCount = await prisma.classSession.count({ where: { disciplineId: id } });
    if (classesCount > 0) {
      throw new ValidationError("Cannot delete discipline that is being used by classes. Deactivate it instead.");
    }
  }

  private async afterCreate(record: Discipline): Promise<void> {
    clearCache();
    console.log(`[DisciplineService] Discipline created: ${record.id} (${record.name})`);
  }

  private async afterUpdate(orgId: string, updatedRecord: Discipline, previousRecord: Discipline): Promise<void> {
    clearCache();

    const deactivated = previousRecord.isActive && !updatedRecord.isActive;
    const activated = !previousRecord.isActive && updatedRecord.isActive;
    const scheduleChanged = JSON.stringify(previousRecord.schedule) !== JSON.stringify(updatedRecord.schedule);

    if (previousRecord.isActive !== updatedRecord.isActive) {
      console.log(`[DisciplineService] Discipline status changed: ${updatedRecord.id} (${previousRecord.isActive ? "active" : "inactive"} -> ${updatedRecord.isActive ? "active" : "inactive"})`);
    }

    if (scheduleChanged || deactivated || activated) {
      let triggerReason = deactivated ? "DESACTIVACIÓN" : "CAMBIO DE HORARIO";
      if (activated && !scheduleChanged) triggerReason = "ACTIVACIÓN";

      console.log(`[DisciplineService] Iniciando limpieza por ${triggerReason} para: ${updatedRecord.name}.`);
      
      try {
        const now = new Date();
        const deleteResult = await prisma.classSession.deleteMany({
          where: {
            disciplineId: updatedRecord.id,
            dateTime: { gte: now },
            registrations: { none: { status: 'registered' } }
          }
        });

        console.log(`[DisciplineService] Limpieza completada: se eliminaron ${deleteResult.count} clases futuras sin alumnos.`);

        if ((scheduleChanged || activated) && updatedRecord.isActive) {
          console.log("[DisciplineService] Re-generando clases con el nuevo patrón (Ventana 15 días)...");
          await generateClassesFromSchedules(orgId, undefined, undefined, updatedRecord.id);
          console.log("[DisciplineService] Re-generación completada.");
        } else if (deactivated) {
          console.log("[DisciplineService] Disciplina inactiva: las clases futuras CON alumnos permanecen para gestión manual.");
        }
      } catch (e) {
        console.error("[DisciplineService] Error en sincronización/limpieza de disciplina:", e);
      }
    }
  }

  private async afterDelete(deletedRecord: Discipline): Promise<void> {
    clearCache();
    console.log(`[DisciplineService] Discipline deleted: ${deletedRecord.id} (${deletedRecord.name})`);

    try {
      const affectedInstructors = await prisma.instructor.findMany({});
      const toUpdate = affectedInstructors.filter((inst) => {
        const profile = (inst.profile as { specialties?: string[] }) || {};
        return Array.isArray(profile.specialties) && profile.specialties.includes(deletedRecord.id);
      });

      await Promise.all(
        toUpdate.map((inst) => {
          const profile = (inst.profile as { specialties?: string[]; userId?: string }) || {};
          const filtered = (profile.specialties ?? []).filter((id) => id !== deletedRecord.id);
          return prisma.instructor.update({
            where: { id: inst.id },
            data: { profile: { ...profile, specialties: filtered } as any },
          });
        })
      );

      if (toUpdate.length > 0) {
        console.log(`[DisciplineService] Cleaned orphaned specialties from ${toUpdate.length} instructor(s).`);
      }
    } catch (e) {
      console.error("[DisciplineService] Error cleaning instructor specialties:", e);
    }
  }
}

export const disciplineService = new DisciplineService();
