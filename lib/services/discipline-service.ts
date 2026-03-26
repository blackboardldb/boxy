// Enhanced DisciplineService using new data layer architecture
// Maintains existing API while using new provider-based architecture

import { BaseService } from "./base-service";
import { Discipline } from "../types";
import { DisciplineRepository } from "../data-layer/types";
import { ApiResponse, PaginatedApiResponse } from "../api/types";
import { generatedSchemas, createSchemas, validateWithSchema } from "../types/generator";
import { ValidationError } from "../errors/types";
import { generateClassesFromSchedules } from "../utils/class-generator";
import { prisma } from "../prisma";

export class DisciplineService extends BaseService<Discipline> {
  protected repositoryName = "disciplines" as const;

  // Get the typed discipline repository
  private get disciplineRepository(): DisciplineRepository {
    return this.repository as DisciplineRepository;
  }

  // Enhanced methods using new architecture

  // Get disciplines with pagination and filtering
  async getDisciplines(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<PaginatedApiResponse<Discipline>> {
    const findParams: any = {
      page: params?.page || 1,
      limit: params?.limit || 50,
    };

    // Build where clause
    const where: any = {};

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (Object.keys(where).length > 0) {
      findParams.where = where;
    }

    return this.findMany(findParams);
  }

  // Get discipline by ID
  async getDisciplineById(id: string): Promise<ApiResponse<Discipline | null>> {
    return this.findById(id);
  }

  // Get active disciplines
  async getActiveDisciplines(): Promise<ApiResponse<Discipline[]>> {
    return this.withCache(
      "active_disciplines",
      async () => {
        const activeDisciplinesResult = await this.disciplineRepository.findMany({
          where: { isActive: true },
          limit: 1000
        });
        return this.createSuccessResponse(activeDisciplinesResult.items);
      },
      10 * 60 * 1000 // Cache for 10 minutes
    );
  }

  // Create discipline
  async createDiscipline(
    disciplineData: any
  ): Promise<ApiResponse<Discipline>> {
    return this.create(disciplineData);
  }

  // Update discipline
  async updateDiscipline(
    id: string,
    disciplineData: any
  ): Promise<ApiResponse<Discipline>> {
    return this.update(id, disciplineData);
  }

  // Delete discipline
  async deleteDiscipline(id: string): Promise<ApiResponse<Discipline>> {
    return this.delete(id);
  }

  // Get discipline statistics
  async getDisciplineStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      mostPopular: string | null;
    }>
  > {
    return this.withCache(
      "discipline_stats",
      async () => {
        const allDisciplines = await this.disciplineRepository.findMany({ limit: 1000 });
        const items = allDisciplines.items;
        const stats = {
          total: items.length,
          active: items.filter(d => d.isActive).length,
          inactive: items.filter(d => !d.isActive).length,
          mostPopular: null // Calcular o dejar null según sea necesario
        };
        return this.createSuccessResponse(stats);
      },
      5 * 60 * 1000 // Cache for 5 minutes
    );
  }

  // Validation hooks

  protected async validateCreateData(data: any): Promise<void> {
    console.log("[DisciplineService] validateCreateData received:", JSON.stringify(data));

    // Validate using create schema (id is optional for creation)
    validateWithSchema(createSchemas.discipline, data);

    // Additional business validation
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Discipline name is required", "name");
    }

    // Check for duplicate names using findByName (efficient, case-insensitive)
    const existing = await this.disciplineRepository.findByName(data.name.trim());
    if (existing) {
      throw new ValidationError(
        "A discipline with this name already exists",
        "name"
      );
    }
  }

  protected async validateUpdateData(
    id: string,
    data: any,
    existingRecord: Discipline
  ): Promise<void> {
    // Validate using generated schema (partial)
    const updateSchema = generatedSchemas.discipline.partial();
    validateWithSchema(updateSchema, data);

    // Check for duplicate names if name is being changed
    if (data.name && data.name !== existingRecord.name) {
      const existingDisciplines = await this.disciplineRepository.findMany();
      const duplicateName = existingDisciplines.items.find(
        (d) => d.id !== id && d.name.toLowerCase() === data.name.toLowerCase()
      );

      if (duplicateName) {
        throw new ValidationError(
          "A discipline with this name already exists",
          "name"
        );
      }
    }
  }

  protected async validateDelete(
    id: string,
    existingRecord: Discipline
  ): Promise<void> {
    // Check if discipline is being used by classes
    const classesUsingDiscipline = await this.dataProvider.classes.findMany({
      where: { disciplineId: id },
    });

    if (classesUsingDiscipline.items.length > 0) {
      throw new ValidationError(
        "Cannot delete discipline that is being used by classes. Deactivate it instead."
      );
    }
  }

  // Lifecycle hooks

  protected async afterCreate(record: Discipline): Promise<void> {
    // Clear cache
    this.clearCache();

    console.log(
      `[DisciplineService] Discipline created: ${record.id} (${record.name})`
    );
  }

   protected async afterUpdate(
    updatedRecord: Discipline,
    previousRecord: Discipline
  ): Promise<void> {
    // Clear cache
    this.clearCache();

    // Significant flags
    const deactivated = previousRecord.isActive && !updatedRecord.isActive;
    const scheduleChanged = JSON.stringify(previousRecord.schedule) !== JSON.stringify(updatedRecord.schedule);

    // 1. Log status Change
    if (previousRecord.isActive !== updatedRecord.isActive) {
      console.log(
        `[DisciplineService] Discipline status changed: ${updatedRecord.id} (${
          previousRecord.isActive ? "active" : "inactive"
        } -> ${updatedRecord.isActive ? "active" : "inactive"})`
      );
    }

    // 2. Automatic Synchronization & Cleanup
    if (scheduleChanged || deactivated) {
      const triggerReason = deactivated ? "DESACTIVACIÓN" : "CAMBIO DE HORARIO";
      console.log(
        `[DisciplineService] Iniciando limpieza por ${triggerReason} para: ${updatedRecord.name}.`
      );
      
      try {
        const now = new Date();
        // Limpieza masiva de clases futuras SIN alumnos inscritos
        const deleteResult = await prisma.classSession.deleteMany({
          where: {
            disciplineId: updatedRecord.id,
            dateTime: { gte: now },
            registeredParticipantsIds: { equals: [] }
          }
        });

        console.log(`[DisciplineService] Limpieza completada: se eliminaron ${deleteResult.count} clases futuras sin alumnos.`);

        // 3. Re-generar clases solo SI está activa y cambió el horario
        if (scheduleChanged && updatedRecord.isActive) {
          console.log("[DisciplineService] Re-generando clases con el nuevo patrón...");
          const start = new Date();
          start.setDate(1); // Desde inicio de mes actual
          const end = new Date();
          end.setMonth(end.getMonth() + 2);
          end.setDate(0); // Hasta fin del mes siguiente

          await generateClassesFromSchedules(start, end, updatedRecord.id);
          console.log("[DisciplineService] Re-generación completada.");
        } else if (deactivated) {
          console.log("[DisciplineService] Disciplina inactiva: las clases futuras CON alumnos permanecen para gestión manual.");
        }
      } catch (e) {
        console.error("[DisciplineService] Error en sincronización/limpieza de disciplina:", e);
      }
    }
  }

  protected async afterDelete(deletedRecord: Discipline): Promise<void> {
    // Clear cache
    this.clearCache();

    console.log(
      `[DisciplineService] Discipline deleted: ${deletedRecord.id} (${deletedRecord.name})`
    );
  }

  // Helper methods

  private createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      data,
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        processingTime: this.getProcessingTime(),
      },
    };
  }
}
