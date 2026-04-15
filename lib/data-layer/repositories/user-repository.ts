import { UserRepository as IUserRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { FitCenterUserProfile, FitCenterMembership, MembershipStatus } from "../../types";
import { prisma } from "../../prisma";

// ─── Helper: UserMembership row → FitCenterMembership shape ─────────────────
// HAL-01 Fase 3A: La fuente de verdad es ahora la tabla user_memberships.
// Los campos @deprecated de centerStats se devuelven como 0 — se calculan
// en tiempo real desde ClassRegistration (HAL-09, sprint futuro).
function mapUserMembershipRow(um: any): FitCenterMembership | undefined {
  if (!um) return undefined;

  const toISODate = (d: Date | null | undefined): string =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  return {
    id: um.id,
    organizationId: um.organizationId,
    organizationName: "",               // enriquecible con join a Organization si se necesita
    status: um.status as MembershipStatus,
    membershipType: um.membershipType || "",
    planId: um.planId ?? undefined,
    monthlyPrice: um.monthlyPrice ?? 0,
    startDate: toISODate(um.startDate),
    currentPeriodStart: toISODate(um.currentPeriodStart),
    currentPeriodEnd: toISODate(um.currentPeriodEnd),
    planConfig: {
      classLimit: um.classLimit,
      disciplineAccess: um.disciplineAccess as "all" | "limited",
      allowedDisciplines: um.allowedDisciplines ?? [],
      canFreeze: um.canFreeze,
      freezeDurationDays: um.freezeDurationDays,
      autoRenews: um.autoRenews,
    },
    // centerStats: contadores @deprecated → 0. Calcular desde ClassRegistration en HAL-09.
    centerStats: {
      currentMonth: {
        classesAttended: 0,
        classesContracted: um.classLimit,
        remainingClasses: 0,
        noShows: 0,
        lastMinuteCancellations: 0,
      },
      totalMonthsActive: 0,
      memberSince: toISODate(um.startDate),
      lifetimeStats: {
        totalClasses: 0,
        totalNoShows: 0,
        averageMonthlyAttendance: 0,
        bestMonth: { month: "", year: 0, count: 0 },
      },
    },
    centerConfig: {
      allowCancellation: um.allowCancellation,
      cancellationHours: um.cancellationHours,
      maxBookingsPerDay: um.maxBookingsPerDay,
      autoWaitlist: um.autoWaitlist,
    },
  } as FitCenterMembership;
}

// ─── Helper: membership shape → UserMembership upsert data ──────────────────
// Usado en create() y update() para el dual-write Phase 3.
function membershipToUpsertData(m: any, organizationId: string) {
  const safePlanId = (v: string | null | undefined): string | null =>
    v && v.trim() !== "" ? v : null;

  return {
    organizationId,
    planId:             safePlanId(m.planId),
    status:             m.status || "inactive",
    startDate:          m.startDate          ? new Date(m.startDate)          : null,
    currentPeriodStart: m.currentPeriodStart ? new Date(m.currentPeriodStart) : null,
    currentPeriodEnd:   m.currentPeriodEnd   ? new Date(m.currentPeriodEnd)   : null,
    monthlyPrice:       typeof m.monthlyPrice === "number" ? m.monthlyPrice : null,
    membershipType:     m.membershipType?.trim() || null,
    classLimit:         typeof m.planConfig?.classLimit === "number" ? m.planConfig.classLimit : 0,
    disciplineAccess:   m.planConfig?.disciplineAccess === "limited" ? "limited" : "all",
    allowedDisciplines: Array.isArray(m.planConfig?.allowedDisciplines) ? m.planConfig.allowedDisciplines : [],
    canFreeze:          m.planConfig?.canFreeze === true,
    freezeDurationDays: typeof m.planConfig?.freezeDurationDays === "number" ? m.planConfig.freezeDurationDays : 0,
    autoRenews:         m.planConfig?.autoRenews === true,
    allowCancellation:  m.centerConfig?.allowCancellation !== false,
    cancellationHours:  typeof m.centerConfig?.cancellationHours === "number" ? m.centerConfig.cancellationHours : 6,
    maxBookingsPerDay:  typeof m.centerConfig?.maxBookingsPerDay === "number" ? m.centerConfig.maxBookingsPerDay : 3,
    autoWaitlist:       m.centerConfig?.autoWaitlist !== false,
  };
}

export class PrismaUserRepository implements IUserRepository {
  private get prisma() {
    return prisma;
  }

  // ── findMany ──────────────────────────────────────────────────────────────
  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<FitCenterUserProfile>> {
    const page  = params?.page  || 1;
    const limit = params?.limit || params?.take || 10;
    const skip  = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where:   params?.where,
        orderBy: params?.orderBy,
        take:    limit,
        skip,
        include: { userMembership: true },   // ← HAL-01: incluir relación
      }),
      this.prisma.user.count({ where: params?.where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items: users.map((u: any) => this.mapToEntity(u)),
      pagination: {
        page, limit, total, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ── findUnique ────────────────────────────────────────────────────────────
  async findUnique(params: FindUniqueParams): Promise<FitCenterUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where:   params.where as any,
      include: { userMembership: true },     // ← HAL-01
    });
    return user ? this.mapToEntity(user) : null;
  }

  // ── create ────────────────────────────────────────────────────────────────
  // Dual-write Phase 3: escribe en JSONB (backward-compat) Y en UserMembership.
  // El JSONB se elimina en Phase 4.
  async create(data: CreateData<FitCenterUserProfile>): Promise<FitCenterUserProfile> {
    const orgId = (data as any).organizationId ?? "org_blacksheep_001";

    const created = await this.prisma.user.create({
      data: {
        id:               data.id,
        firstName:        data.firstName,
        lastName:         data.lastName,
        email:            data.email,
        phone:            data.phone,
        role:             data.role || "user",
        organizationId:   orgId,
        gender:           (data as any).gender           ?? undefined,
        dateOfBirth:      (data as any).dateOfBirth      ? new Date((data as any).dateOfBirth) : undefined,
        emergencyContact: (data as any).emergencyContact ?? undefined,
        formaDePago:      (data as any).formaDePago      ?? undefined,
        membership:       (data.membership as any)       || undefined,  // JSONB backward-compat
      } as any,
    });

    // Dual-write → UserMembership
    if (data.membership) {
      await this.prisma.userMembership.upsert({
        where:  { userId: created.id },
        create: { userId: created.id, ...membershipToUpsertData(data.membership, orgId) },
        update: {},  // ya existe → no sobreescribir
      });
    }

    // Re-fetch con relación para que mapToEntity lea desde UserMembership
    const withMembership = await this.prisma.user.findUnique({
      where:   { id: created.id },
      include: { userMembership: true },
    });
    return this.mapToEntity(withMembership!);
  }

  // ── update ────────────────────────────────────────────────────────────────
  // Dual-write Phase 3: actualiza JSONB + upsert en UserMembership.
  async update(id: string, data: UpdateData<FitCenterUserProfile>): Promise<FitCenterUserProfile> {
    // Obtener organizationId actual del usuario (fuente de verdad)
    const existing = await this.prisma.user.findUnique({
      where:  { id },
      select: { organizationId: true },
    });
    const orgId = existing?.organizationId ?? "org_blacksheep_001";

    await this.prisma.user.update({
      where: { id },
      data: {
        firstName:        data.firstName,
        lastName:         data.lastName,
        email:            data.email,
        phone:            data.phone,
        role:             data.role,
        gender:           (data as any).gender,
        dateOfBirth:      (data as any).dateOfBirth ? new Date((data as any).dateOfBirth) : undefined,
        emergencyContact: (data as any).emergencyContact,
        formaDePago:      (data as any).formaDePago,
        // JSONB backward-compat: se elimina en Phase 4
        ...(data.membership ? { membership: (data.membership as any) } : {}),
      } as any,
    });

    // Dual-write → UserMembership
    if (data.membership) {
      const upsertData = membershipToUpsertData(data.membership, orgId);
      await this.prisma.userMembership.upsert({
        where:  { userId: id },
        create: { userId: id, ...upsertData },
        update: upsertData,
      });
    }

    // Re-fetch con relación
    const updated = await this.prisma.user.findUnique({
      where:   { id },
      include: { userMembership: true },
    });
    return this.mapToEntity(updated!);
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async delete(id: string): Promise<FitCenterUserProfile> {
    // Leer antes de borrar para poder retornar el entity (CASCADE borra UserMembership)
    const toDelete = await this.prisma.user.findUnique({
      where:   { id },
      include: { userMembership: true },
    });
    if (!toDelete) throw new Error(`User ${id} not found`);
    const entity = this.mapToEntity(toDelete);

    await this.prisma.user.delete({ where: { id } });
    return entity;
  }

  // ── count ─────────────────────────────────────────────────────────────────
  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.user.count({ where: params?.where });
  }

  // ── findByEmail ───────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<FitCenterUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where:   { email },
      include: { userMembership: true },    // ← HAL-01
    });
    return user ? this.mapToEntity(user) : null;
  }

  // ── findByRole ────────────────────────────────────────────────────────────
  async findByRole(role: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where:   { role },
      include: { userMembership: true },    // ← HAL-01
    });
    return users.map((u: any) => this.mapToEntity(u));
  }

  // ── findByMembershipStatus ────────────────────────────────────────────────
  // ANTES: membership: { path: ["status"], equals: status } → Full Table Scan JSONB
  // AHORA: userMembership: { status }                       → índice btree O(log n)
  async findByMembershipStatus(status: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where:   { userMembership: { status } },
      include: { userMembership: true },
    });
    return users.map((u: any) => this.mapToEntity(u));
  }

  // ── getUserStats ──────────────────────────────────────────────────────────
  // ANTES: 5 queries separadas con JSONB path → 5 Full Table Scans
  // AHORA: 1 groupBy en UserMembership           → 1 query con índice btree
  async getUserStats(): Promise<{
    total: number; active: number; pending: number;
    expired: number; inactive: number; frozen: number;
  }> {
    const results = await this.prisma.userMembership.groupBy({
      by:    ["status"],
      where: { organizationId: "org_blacksheep_001" },
      _count: { status: true },
    });

    const stats = { total: 0, active: 0, pending: 0, expired: 0, inactive: 0, frozen: 0 };
    for (const r of results) {
      const key = r.status as keyof typeof stats;
      if (key in stats) stats[key] = r._count.status;
      stats.total += r._count.status;
    }
    return stats;
  }

  // ── updateMembershipStatus ────────────────────────────────────────────────
  // ANTES: Lee JSONB, muta el objeto, escribe JSONB
  // AHORA: Escribe en UserMembership (tabla) + dual-write JSONB para Phase 3
  async updateMembershipStatus(userId: string, status: string): Promise<FitCenterUserProfile> {
    const user = await this.prisma.user.findUnique({
      where:   { id: userId },
      include: { userMembership: true },
    });
    if (!user) throw new Error("User not found");
    if (!user.userMembership) throw new Error("UserMembership not found for user");

    // Escribir en UserMembership (nueva tabla)
    await this.prisma.userMembership.update({
      where: { userId },
      data:  { status },
    });

    // Dual-write: mantener JSONB sincronizado durante Phase 3
    if (user.membership) {
      const currentMembership = { ...(user.membership as any), status };
      await this.prisma.user.update({
        where: { id: userId },
        data:  { membership: currentMembership } as any,
      });
    }

    const updated = await this.prisma.user.findUnique({
      where:   { id: userId },
      include: { userMembership: true },
    });
    return this.mapToEntity(updated!);
  }

  // ── mapToEntity ───────────────────────────────────────────────────────────
  // HAL-01 Fase 3A: Lee desde userMembership (tabla relacional).
  // Fallback al JSONB si userMembership es null (protección ante edge cases).
  private mapToEntity(prismaUser: any): FitCenterUserProfile {
    // Fuente de verdad: tabla user_memberships
    const membership = prismaUser.userMembership
      ? mapUserMembershipRow(prismaUser.userMembership)
      : prismaUser.membership                             // fallback JSONB (edge case)
        ? ({ ...(prismaUser.membership as any) } as any)
        : undefined;

    return {
      id:               prismaUser.id,
      firstName:        prismaUser.firstName,
      lastName:         prismaUser.lastName,
      email:            prismaUser.email,
      phone:            prismaUser.phone,
      role:             prismaUser.role,
      organizationId:   prismaUser.organizationId,
      gender:           prismaUser.gender           ?? undefined,
      dateOfBirth:      prismaUser.dateOfBirth
        ? new Date(prismaUser.dateOfBirth).toISOString().split("T")[0]
        : undefined,
      emergencyContact: prismaUser.emergencyContact ?? undefined,
      formaDePago:      prismaUser.formaDePago      ?? undefined,
      membership:       membership as any,
    } as FitCenterUserProfile;
  }
}