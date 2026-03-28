import { ClassRepository as IClassRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { ClassSession } from "../../types";
import { prisma } from "../../prisma";
import { BaseRepository } from "./base-repository";

export class PrismaClassRepository implements IClassRepository {
  private get prisma() {
    return prisma;
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
        select: {
          id: true,
          name: true,
          dateTime: true,
          durationMinutes: true,
          instructorId: true,
          disciplineId: true,
          capacity: true,
          status: true,
          _count: {
            select: { registrations: true }
          }
        }
      }),
      this.prisma.classSession.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: classes.map((c: any) => ({
        ...this.mapToEntity(c),
        enrolledCount: c._count?.registrations ?? 0
      })),
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
      where: params.where as any,
    });
    return classSession ? this.mapToEntity(classSession) : null;
  }

  async create(data: CreateData<ClassSession>): Promise<ClassSession> {
    const created = await this.prisma.classSession.create({
      data: {
        id: data.id,
        organizationId: data.organizationId || "org_blacksheep_001",
        disciplineId: data.disciplineId,
        name: data.name,
        dateTime: new Date(data.dateTime),
        durationMinutes: data.durationMinutes || 60,
        instructorId: data.instructorId,
        capacity: data.capacity || 15,
        registeredParticipantsIds: data.registeredParticipantsIds || [],
        waitlistParticipantsIds: data.waitlistParticipantsIds || [],
        status: data.status || "scheduled",
        notes: data.notes,
        isGenerated: data.isGenerated || false,
      },
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
        registeredParticipantsIds: data.registeredParticipantsIds,
        waitlistParticipantsIds: data.waitlistParticipantsIds,
        status: data.status,
        notes: data.notes,
        isGenerated: data.isGenerated,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<ClassSession> {
    const deleted = await this.prisma.classSession.delete({
      where: { id },
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
      orderBy: { dateTime: 'asc' }
    });
    return classes.map((c: any) => this.mapToEntity(c));
  }

  async findByDiscipline(disciplineId: string): Promise<ClassSession[]> {
    const classes = await this.prisma.classSession.findMany({
      where: { disciplineId },
      orderBy: { dateTime: 'asc' }
    });
    return classes.map((c: any) => this.mapToEntity(c));
  }

  async findByInstructor(instructorId: string): Promise<ClassSession[]> {
    const classes = await this.prisma.classSession.findMany({
      where: { instructorId },
      orderBy: { dateTime: 'asc' }
    });
    return classes.map((c: any) => this.mapToEntity(c));
  }

  async findByStatus(status: string): Promise<ClassSession[]> {
    const classes = await this.prisma.classSession.findMany({
      where: { status },
      orderBy: { dateTime: 'asc' }
    });
    return classes.map((c: any) => this.mapToEntity(c));
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

  private mapToEntity(prismaClass: any): ClassSession {
    return {
      id: prismaClass.id,
      organizationId: prismaClass.organizationId || "",
      disciplineId: prismaClass.disciplineId || "",
      name: prismaClass.name || "",
      dateTime: prismaClass.dateTime?.toISOString() || new Date().toISOString(),
      durationMinutes: prismaClass.durationMinutes || 60,
      instructorId: prismaClass.instructorId || "",
      capacity: prismaClass.capacity || 15,
      // Tarea 2: Eliminar de listados. Devolvemos vacío para evitar romper UI types.
      registeredParticipantsIds: prismaClass.registeredParticipantsIds || [],
      waitlistParticipantsIds: [], 
      status: (prismaClass.status as any) || "scheduled",
      notes: prismaClass.notes || undefined,
      isGenerated: !!prismaClass.isGenerated,
    };
  }
}
