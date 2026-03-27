import { 
  ClassRegistrationRepository as IClassRegistrationRepository, 
  ClassRegistration,
  FindManyParams, 
  FindUniqueParams, 
  CreateData, 
  UpdateData, 
  CountParams, 
  PaginatedResult 
} from "../types";
import { prisma } from "../../prisma";

export class PrismaClassRegistrationRepository implements IClassRegistrationRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<ClassRegistration>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 50;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      this.prisma.classRegistration.findMany({
        where: params?.where,
        orderBy: params?.orderBy || { registeredAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.classRegistration.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: registrations.map((r: any) => this.mapToEntity(r)),
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

  async findUnique(params: FindUniqueParams): Promise<ClassRegistration | null> {
    const registration = await this.prisma.classRegistration.findUnique({
      where: params.where as any,
    });
    return registration ? this.mapToEntity(registration) : null;
  }

  async create(data: CreateData<ClassRegistration>): Promise<ClassRegistration> {
    const created = await this.prisma.classRegistration.create({
      data: {
        userId: data.userId,
        classId: data.classId,
        status: data.status || "registered",
        notes: data.notes,
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<ClassRegistration>): Promise<ClassRegistration> {
    const updated = await this.prisma.classRegistration.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
        cancelledAt: data.status === 'cancelled' ? new Date() : undefined,
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<ClassRegistration> {
    const deleted = await this.prisma.classRegistration.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.classRegistration.count({
      where: params?.where,
    });
  }

  async findByUser(userId: string): Promise<ClassRegistration[]> {
    const registrations = await this.prisma.classRegistration.findMany({
      where: { userId },
      orderBy: { registeredAt: 'desc' }
    });
    return registrations.map((r: any) => this.mapToEntity(r));
  }

  async findByClass(classId: string): Promise<ClassRegistration[]> {
    const registrations = await this.prisma.classRegistration.findMany({
      where: { classId },
      orderBy: { registeredAt: 'desc' }
    });
    return registrations.map((r: any) => this.mapToEntity(r));
  }

  async countUserRegistrationsInPeriod(
    userId: string, 
    startDate: string | Date, 
    endDate: string | Date,
    excludeCancelled: boolean = true
  ): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Forzamos el final del día para el rango de búsqueda
    if (typeof endDate === 'string') {
        end.setHours(23, 59, 59, 999);
    }

    const where: any = {
      userId,
      class: {
        dateTime: {
          gte: start,
          lte: end,
        },
      },
    };

    if (excludeCancelled) {
      where.status = { not: 'cancelled' };
    }

    return this.prisma.classRegistration.count({ where });
  }

  private mapToEntity(prismaReg: any): ClassRegistration {
    return {
      id: prismaReg.id,
      userId: prismaReg.userId,
      classId: prismaReg.classId,
      status: prismaReg.status,
      registeredAt: prismaReg.registeredAt.toISOString(),
      cancelledAt: prismaReg.cancelledAt?.toISOString(),
      notes: prismaReg.notes || undefined,
    };
  }
}
