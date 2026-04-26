import { InstructorRepository as IInstructorRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { Instructor } from "../../types";
import { ValidationError } from "../../errors/types";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

type InstructorRow = Prisma.InstructorGetPayload<Record<string, never>>;
type InstructorProfile = { specialties?: string[]; userId?: string };

export class PrismaInstructorRepository implements IInstructorRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<Instructor>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 10;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [instructors, total] = await Promise.all([
      this.prisma.instructor.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
        take: limit,
        skip,
        select: params?.select as Prisma.InstructorSelect | undefined,
      }),
      this.prisma.instructor.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: instructors.map((i) => this.mapToEntity(i as InstructorRow)),
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

  async findUnique(params: FindUniqueParams): Promise<Instructor | null> {
    const instructor = await this.prisma.instructor.findUnique({
      where: params.where as Prisma.InstructorWhereUniqueInput,
    });
    return instructor ? this.mapToEntity(instructor) : null;
  }

  async create(data: CreateData<Instructor>): Promise<Instructor> {
    const created = await this.prisma.instructor.create({
      data: {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role || "coach",
        isActive: data.isActive ?? true,
        profile: {
          specialties: data.specialties || [],
          userId: data.userId,
        },
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<Instructor>): Promise<Instructor> {
    const existing = await this.prisma.instructor.findUnique({ where: { id } });
    const currentProfile = (existing?.profile as InstructorProfile) || {};

    const updated = await this.prisma.instructor.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        isActive: data.isActive,
        profile: {
          ...currentProfile,
          specialties: data.specialties !== undefined ? data.specialties : currentProfile.specialties,
          userId: data.userId !== undefined ? data.userId : currentProfile.userId,
        },
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<Instructor> {
    const deleted = await this.prisma.instructor.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.instructor.count({
      where: params?.where,
    });
  }

  async findActive(): Promise<Instructor[]> {
    return this.findByStatus("active");
  }

  async findByDiscipline(disciplineId: string): Promise<Instructor[]> {
    const allInstructors = await this.prisma.instructor.findMany({
      where: { isActive: true }
    });
    return allInstructors
      .map(i => this.mapToEntity(i))
      .filter(instructor => instructor.specialties.includes(disciplineId));
  }

  async findByStatus(status: string): Promise<Instructor[]> {
    const instructors = await this.prisma.instructor.findMany({
      where: {
        isActive: status === "active"
      }
    });
    return instructors.map(this.mapToEntity);
  }

  async getInstructorStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    const [total, active, admins, coaches] = await Promise.all([
      this.prisma.instructor.count(),
      this.prisma.instructor.count({ where: { isActive: true } }),
      this.prisma.instructor.count({ where: { role: "admin" } }),
      this.prisma.instructor.count({ where: { role: "coach" } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: {
        admin: admins,
        coach: coaches,
      },
    };
  }

  private mapToEntity(prismaInstructor: InstructorRow): Instructor {
    const profile = (prismaInstructor.profile as InstructorProfile) || {};
    return {
      id: prismaInstructor.id,
      organizationId: (prismaInstructor as unknown as { organizationId?: string }).organizationId ?? "org_blacksheep_001",
      firstName: prismaInstructor.firstName,
      lastName: prismaInstructor.lastName,
      email: prismaInstructor.email,
      phone: prismaInstructor.phone || undefined,
      role: prismaInstructor.role as "admin" | "coach",
      isActive: prismaInstructor.isActive,
      specialties: profile.specialties || [],
      userId: profile.userId,
    };
  }
}
