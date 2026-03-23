// Discipline repository implementation
// Extracted from mock-database.ts and enhanced with proper typing and error handling

import { BaseRepository } from "./base-repository";
import { DisciplineRepository as IDisciplineRepository } from "../types";
import { Discipline } from "../../types";
import { initialDisciplines } from "../../mock-data";
import { ValidationError } from "../../errors/types";

// Mock implementation of DisciplineRepository
export class MockDisciplineRepository
  extends BaseRepository<Discipline>
  implements IDisciplineRepository
{
  protected entityName = "Discipline";
  protected data: Discipline[];

  constructor() {
    super();
    // Initialize with mock data
    this.data = [...initialDisciplines];
  }

  // Find active disciplines
  async findActive(): Promise<Discipline[]> {
    try {
      return this.data.filter((discipline) => discipline.isActive);
    } catch (error) {
      throw new Error(`Failed to find active disciplines: ${error}`);
    }
  }

  // Find discipline by name
  async findByName(name: string): Promise<Discipline | null> {
    try {
      const discipline = this.data.find(
        (d) => d.name.toLowerCase() === name.toLowerCase()
      );
      return discipline || null;
    } catch (error) {
      throw new Error(`Failed to find discipline by name: ${error}`);
    }
  }

  // Enhanced filtering for discipline queries
  protected applyFilters(
    results: Discipline[],
    where: Record<string, any>
  ): Discipline[] {
    return results.filter((discipline) => {
      // Active status filter
      if (
        where.isActive !== undefined &&
        discipline.isActive !== where.isActive
      ) {
        return false;
      }

      // Name filter
      if (where.name && discipline.name !== where.name) {
        return false;
      }

      // Apply base filtering for other criteria
      return this.matchesCriteria(discipline, where);
    });
  }

  // Validate discipline record
  protected validateRecord(record: Discipline): void {
    super.validateRecord(record);

    if (!record.name?.trim()) {
      throw new ValidationError("Discipline name is required", "name");
    }

    // Check for duplicate name (excluding current record for updates)
    const existingDiscipline = this.data.find(
      (d) =>
        d.name.toLowerCase() === record.name.toLowerCase() && d.id !== record.id
    );
    if (existingDiscipline) {
      throw new ValidationError("Discipline name already exists", "name", {
        existingDisciplineId: existingDiscipline.id,
      });
    }

    // Validate schedule if present
    if (record.schedule && Array.isArray(record.schedule)) {
      this.validateSchedule(record.schedule);
    }

    // Validate cancellation rules if present
    if (record.cancellationRules && Array.isArray(record.cancellationRules)) {
      this.validateCancellationRules(record.cancellationRules);
    }
  }

  // Validate schedule data
  private validateSchedule(schedule: any[]): void {
    const validDays = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
    const timeRegex = /^\d{2}:\d{2}$/;

    for (const scheduleItem of schedule) {
      if (!scheduleItem.day || !validDays.includes(scheduleItem.day)) {
        throw new ValidationError(
          `Invalid day. Must be one of: ${validDays.join(", ")}`,
          "schedule.day"
        );
      }

      if (!Array.isArray(scheduleItem.times)) {
        throw new ValidationError(
          "Schedule times must be an array",
          "schedule.times"
        );
      }

      for (const time of scheduleItem.times) {
        if (!timeRegex.test(time)) {
          throw new ValidationError(
            "Invalid time format. Must be HH:mm",
            "schedule.times"
          );
        }
      }
    }
  }

  // Validate cancellation rules
  private validateCancellationRules(rules: any[]): void {
    const timeRegex = /^\d{2}:\d{2}$/;

    for (const rule of rules) {
      if (!rule.id) {
        throw new ValidationError(
          "Cancellation rule must have an ID",
          "cancellationRules.id"
        );
      }

      if (!rule.time || !timeRegex.test(rule.time)) {
        throw new ValidationError(
          "Invalid time format in cancellation rule. Must be HH:mm",
          "cancellationRules.time"
        );
      }

      if (typeof rule.hoursBefore !== "number" || rule.hoursBefore < 0) {
        throw new ValidationError(
          "Hours before must be a non-negative number",
          "cancellationRules.hoursBefore"
        );
      }

      if (typeof rule.priority !== "number" || rule.priority < 0) {
        throw new ValidationError(
          "Priority must be a non-negative number",
          "cancellationRules.priority"
        );
      }
    }
  }

  // Discipline-specific utility methods

  // Get disciplines with schedules
  async getDisciplinesWithSchedules(): Promise<Discipline[]> {
    return this.data.filter(
      (discipline) => discipline.schedule && discipline.schedule.length > 0
    );
  }

  // Get disciplines by color
  async getDisciplinesByColor(color: string): Promise<Discipline[]> {
    return this.data.filter((discipline) => discipline.color === color);
  }

  // Toggle discipline active status
  async toggleActiveStatus(disciplineId: string): Promise<Discipline> {
    const discipline = await this.findById(disciplineId);
    if (!discipline) {
      throw new Error("Discipline not found");
    }

    const updatedDiscipline = await this.update(disciplineId, {
      isActive: !discipline.isActive,
    });

    return updatedDiscipline;
  }

  // Get discipline statistics
  async getDisciplineStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withSchedules: number;
  }> {
    const total = this.data.length;
    const active = this.data.filter((d) => d.isActive).length;
    const inactive = this.data.filter((d) => !d.isActive).length;
    const withSchedules = this.data.filter(
      (d) => d.schedule && d.schedule.length > 0
    ).length;

    return { total, active, inactive, withSchedules };
  }
}

import { prisma } from "../../prisma";

export class PrismaDisciplineRepository implements IDisciplineRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params?: any): Promise<any> {
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

  async findUnique(params: any): Promise<Discipline | null> {
    const discipline = await this.prisma.discipline.findUnique({
      where: params.where,
    });
    return discipline ? this.mapToEntity(discipline) : null;
  }

  async create(data: any): Promise<Discipline> {
    const created = await this.prisma.discipline.create({
      data: {
        id: data.id,
        organizationId: data.organizationId || "org_blacksheep_001",
        name: data.name,
        description: data.description,
        color: data.color || "#3b82f6",
        isActive: data.isActive ?? true,
        schedule: data.schedule || [],
        cancellationRules: data.cancellationRules || [],
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: any): Promise<Discipline> {
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

  async count(params?: any): Promise<number> {
    return this.prisma.discipline.count({
      where: params?.where,
    });
  }

  async findActive(): Promise<Discipline[]> {
    const active = await this.prisma.discipline.findMany({
      where: { isActive: true },
    });
    return active.map(this.mapToEntity);
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
