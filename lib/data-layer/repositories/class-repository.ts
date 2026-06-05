import { ClassRepository as IClassRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { ClassSession, ClassStatus } from "../../types";
import { prisma } from "../../prisma";
import { BaseRepository } from "./base-repository";
import { Prisma } from "@prisma/client";

type ClassRegistrationRow = { userId: string; status: string };

// Tipo derivado del select real que usa este repositorio.
// Se define después de la clase, pero TypeScript lo infiere correctamente.
type ClassRowWithRegistrations = {
  id: string;
  name: string;
  organizationId: string;
  disciplineId: string;
  dateTime: Date;
  durationMinutes: number;
  instructorId: string;
  capacity: number;
  status: string;
  notes: string | null;
  isGenerated: boolean;
  _count: { registrations: number };
};

export class PrismaClassRepository implements IClassRepository {
  private get prisma() {
    return prisma;
  }

  private get defaultSelect() {
    return {
      id: true,
      organizationId: true,
      name: true,
      dateTime: true,
      durationMinutes: true,
      instructorId: true,
      disciplineId: true,
      capacity: true,
      status: true,
      notes: true,
      isGenerated: true,
      // HAL-03 Sprint A: registeredParticipantsIds ya no se lee de la columna array.
      // Se calcula en mapToEntity() desde la relación ClassRegistration.
      _count: {
        select: {
          registrations: {
            where: { status: "registered" }
          }
        }
      }
    };
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<ClassSession>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 10;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [classes, total] = await Promise.all([
      this.prisma.classSession.findMany({
        where: params?.where,
        orderBy: params?.orderBy || { dateTime: 'asc' },
        take: limit,
        skip,
        select: this.defaultSelect
      }),
      this.prisma.classSession.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: classes.map((c) => this.mapToEntity(c as ClassRowWithRegistrations)),
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

  async findUnique(params: FindUniqueParams): Promise<ClassSession | null> {
    const classSession = await this.prisma.classSession.findUnique({
      where: params.where as Prisma.ClassSessionWhereUniqueInput,
      select: this.defaultSelect
    });
    return classSession ? this.mapToEntity(classSession) : null;
  }

  async create(data: CreateData<ClassSession>): Promise<ClassSession> {
    if (!data.organizationId) throw new Error("organizationId is required");
    const created = await this.prisma.classSession.create({
      data: {
        id: data.id,
        organizationId: data.organizationId,
        disciplineId: data.disciplineId,
        name: data.name,
        dateTime: new Date(data.dateTime),
        durationMinutes: data.durationMinutes || 60,
        instructorId: data.instructorId,
        capacity: data.capacity || 15,
        status: data.status || "scheduled",
        notes: data.notes,
        isGenerated: data.isGenerated || false,
      },
      select: this.defaultSelect
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<ClassSession>): Promise<ClassSession> {
    const updated = await this.prisma.classSession.update({
      where: { id },
      data: {
        disciplineId: data.disciplineId,
        name: data.name,
        dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
        durationMinutes: data.durationMinutes,
        instructorId: data.instructorId,
        capacity: data.capacity,
        status: data.status,
        notes: data.notes,
        isGenerated: data.isGenerated,
      },
      select: this.defaultSelect
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<ClassSession> {
    const deleted = await this.prisma.classSession.delete({
      where: { id },
      select: this.defaultSelect
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.classSession.count({
      where: params?.where,
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<ClassSession[]> {
    const classes = await this.prisma.classSession.findMany({
      where: {
        dateTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { dateTime: 'asc' },
      select: this.defaultSelect
    });
    return classes.map((c) => this.mapToEntity(c as ClassRowWithRegistrations));
  }

  async findByDiscipline(disciplineId: string): Promise<ClassSession[]> {
    const classes = await this.prisma.classSession.findMany({
      where: { disciplineId },
      orderBy: { dateTime: 'asc' },
      select: this.defaultSelect
    });
    return classes.map((c) => this.mapToEntity(c as ClassRowWithRegistrations));
  }

  async findByInstructor(instructorId: string): Promise<ClassSession[]> {
    const classes = await this.prisma.classSession.findMany({
      where: { instructorId },
      orderBy: { dateTime: 'asc' },
      select: this.defaultSelect
    });
    return classes.map((c) => this.mapToEntity(c as ClassRowWithRegistrations));
  }

  async findByStatus(status: string): Promise<ClassSession[]> {
    const classes = await this.prisma.classSession.findMany({
      where: { status },
      orderBy: { dateTime: 'asc' },
      select: this.defaultSelect
    });
    return classes.map((c) => this.mapToEntity(c as ClassRowWithRegistrations));
  }

  async getClassStats(): Promise<{
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    inProgress: number;
  }> {
    const [total, scheduled, completed, cancelled, inProgress] = await Promise.all([
      this.prisma.classSession.count(),
      this.prisma.classSession.count({ where: { status: "scheduled" } }),
      this.prisma.classSession.count({ where: { status: "completed" } }),
      this.prisma.classSession.count({ where: { status: "cancelled" } }),
      this.prisma.classSession.count({ where: { status: "in_progress" } }),
    ]);

    return { total, scheduled, completed, cancelled, inProgress };
  }

  private mapToEntity(prismaClass: ClassRowWithRegistrations): ClassSession {
    return {
      id: prismaClass.id,
      organizationId: prismaClass.organizationId || "",
      disciplineId: prismaClass.disciplineId || "",
      name: prismaClass.name || "",
      dateTime: prismaClass.dateTime?.toISOString() || new Date().toISOString(),
      durationMinutes: prismaClass.durationMinutes || 60,
      instructorId: prismaClass.instructorId || "",
      capacity: prismaClass.capacity || 15,
      // HAL-03 Sprint A: calculado desde ClassRegistration (fuente de verdad).
      status: (prismaClass.status as ClassStatus) || "scheduled",
      notes: prismaClass.notes || undefined,
      isGenerated: !!prismaClass.isGenerated,
      enrolledCount: prismaClass._count?.registrations ?? 0,
    };
  }
}
