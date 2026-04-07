import { UserRepository as IUserRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { FitCenterUserProfile } from "../../types";
import { prisma } from "../../prisma";

export class PrismaUserRepository implements IUserRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<FitCenterUserProfile>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 10;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
        take: limit,
        skip,
      }),
      this.prisma.user.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: users.map((u: any) => this.mapToEntity(u)),
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

  async findUnique(params: FindUniqueParams): Promise<FitCenterUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: params.where as any,
    });
    return user ? this.mapToEntity(user) : null;
  }

  async create(data: CreateData<FitCenterUserProfile>): Promise<FitCenterUserProfile> {
    const created = await this.prisma.user.create({
      data: {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role || "user",
        organizationId: (data as any).organizationId ?? "org_blacksheep_001",
        gender: (data as any).gender ?? undefined,
        dateOfBirth: (data as any).dateOfBirth ? new Date((data as any).dateOfBirth) : undefined,
        emergencyContact: (data as any).emergencyContact ?? undefined,
        formaDePago: (data as any).formaDePago ?? undefined,
        membership: (data.membership as any) || undefined,
      } as any,
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<FitCenterUserProfile>): Promise<FitCenterUserProfile> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        gender: (data as any).gender,
        dateOfBirth: (data as any).dateOfBirth ? new Date((data as any).dateOfBirth) : undefined,
        emergencyContact: (data as any).emergencyContact,
        formaDePago: (data as any).formaDePago,
        membership: (data.membership as any),
      } as any,
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<FitCenterUserProfile> {
    const deleted = await this.prisma.user.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.user.count({
      where: params?.where,
    });
  }

  async findByEmail(email: string): Promise<FitCenterUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findByRole(role: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where: { role },
    });
    return users.map((u: any) => this.mapToEntity(u));
  }

  async findByMembershipStatus(status: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where: { role: "user" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        membership: true,
        organizationId: true,
      },
    } as any);
    const filtered = users.filter(
      (u: any) => u.membership && (u.membership as any).status === status
    );
    return filtered.map((u: any) => this.mapToEntity(u));
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    expired: number;
    inactive: number;
  }> {
    const [total, active, pending, expired] = await Promise.all([
      this.prisma.user.count({ where: { role: "user" } }),
      this.prisma.user.count({ where: { role: "user", membership: { path: ["status"], equals: "active" } } as any }),
      this.prisma.user.count({ where: { role: "user", membership: { path: ["status"], equals: "pending" } } as any }),
      this.prisma.user.count({ where: { role: "user", membership: { path: ["status"], equals: "expired" } } as any }),
    ]);
    const inactive = total - active - pending - expired;
    return { total, active, pending, expired, inactive };
  }

  async updateMembershipStatus(userId: string, status: string): Promise<FitCenterUserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    let currentMembership = user.membership as any;
    if (!currentMembership) throw new Error("User has no membership to update");

    currentMembership.status = status;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { membership: currentMembership }
    });

    return this.mapToEntity(updatedUser);
  }

  private mapToEntity(prismaUser: any): FitCenterUserProfile {
    const membership = prismaUser.membership ? { ...(prismaUser.membership as any) } : undefined;

    return {
      id: prismaUser.id,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      email: prismaUser.email,
      phone: prismaUser.phone,
      role: prismaUser.role,
      organizationId: prismaUser.organizationId,
      gender: prismaUser.gender ?? undefined,
      dateOfBirth: prismaUser.dateOfBirth
        ? new Date(prismaUser.dateOfBirth).toISOString().split("T")[0]
        : undefined,
      emergencyContact: prismaUser.emergencyContact ?? undefined,
      formaDePago: prismaUser.formaDePago ?? undefined,
      membership: membership as any,
    } as FitCenterUserProfile;
  }
}