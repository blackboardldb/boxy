import { UserRepository as IUserRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { FitCenterUserProfile, FitCenterMembership, MembershipStatus } from "../../types";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

// Tipo inferido de Prisma para un User con su UserMembership incluido.
type UserWithMembership = Prisma.UserGetPayload<{ include: { userMembership: true, membershipRenewals: true } }>;

// ─── Helper: UserMembership row → FitCenterMembership shape ─────────────────
// HAL-01 Fase 3A: La fuente de verdad es ahora la tabla user_memberships.
// Los campos @deprecated de centerStats se devuelven como 0 — se calculan
// en tiempo real desde ClassRegistration (HAL-09, sprint futuro).
function mapUserMembershipRow(um: NonNullable<UserWithMembership["userMembership"]>): FitCenterMembership | undefined {
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
        remainingClasses: um.classLimit,  // valor contratado — HAL-09 calculará el real desde ClassRegistration
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
  console.log('[DEBUG membershipToUpsertData] status recibido:', m.status);
  console.log('[DEBUG membershipToUpsertData] currentPeriodStart:', m.currentPeriodStart);
  
  const safePlanId = (v: string | null | undefined): string | null =>
    v && v.trim() !== "" ? v : null;

  return {
    organizationId,
    planId:             safePlanId(m.planId),
    status:             m.status || "inactive",
    startDate:          m.startDate 
      ? new Date(m.startDate) 
      : m.currentPeriodStart 
        ? new Date(m.currentPeriodStart) 
        : null,
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
        include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },   // ← HAL-01: incluir relación
      }),
      this.prisma.user.count({ where: params?.where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items: users.map((u) => this.mapToEntity(u)),
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
      where:   params.where as Prisma.UserWhereUniqueInput,
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },     // ← HAL-01
    });
    return user ? this.mapToEntity(user) : null;
  }

  // ── create ────────────────────────────────────────────────────────────────
  // Dual-write Phase 3: escribe en JSONB (backward-compat) Y en UserMembership.
  // El JSONB se elimina en Phase 4.
  async create(data: CreateData<FitCenterUserProfile>): Promise<FitCenterUserProfile> {
    const orgId = data.organizationId ?? "org_blacksheep_001";

    const created = await this.prisma.user.create({
      data: {
        id:               data.id,
        firstName:        data.firstName,
        lastName:         data.lastName,
        email:            data.email,
        phone:            data.phone ?? undefined,
        role:             data.role || "user",
        organizationId:   orgId,
        gender:           data.gender           ?? undefined,
        dateOfBirth:      data.dateOfBirth       ? new Date(data.dateOfBirth) : undefined,
        emergencyContact: data.emergencyContact  ?? undefined,
        formaDePago:      data.formaDePago       ?? undefined,
        // HAL-01 Fase 4 Sprint 4: membership JSONB eliminado del create
      },
    });

    // Si viene membership en el payload, persistir en UserMembership (tabla relacional)
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
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },
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
        phone:            data.phone       ?? undefined,
        role:             data.role,
        gender:           data.gender,
        dateOfBirth:      data.dateOfBirth  ? new Date(data.dateOfBirth) : undefined,
        emergencyContact: data.emergencyContact,
        formaDePago:      data.formaDePago,
        // HAL-01 Fase 4 Sprint 4: membership JSONB eliminado del update
      },
    });

    // Si viene membership en el payload, bifurcar según fecha de inicio:
    //   Fecha futura  → crear MembershipRenewal { status: 'scheduled' } — NO tocar UserMembership
    //   Fecha hoy/pasada → upsert normal en UserMembership
    if (data.membership) {
      const m = data.membership as any;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = m.currentPeriodStart ? new Date(m.currentPeriodStart) : null;
      const isScheduledPlan = startDate !== null && startDate > today;

      if (isScheduledPlan) {
        // Plan futuro → staging en MembershipRenewal (UserMembership no se toca)
        await this.prisma.membershipRenewal.create({
          data: {
            userId: id,
            currentPlanId: m.planId ?? null,
            requestedPlanId: m.planId ?? null,
            status: 'scheduled',
            paymentMethod: (data as any).formaDePago ?? null,
            renewalDetails: {
              startDate:      m.currentPeriodStart,
              endDate:        m.currentPeriodEnd,
              monthlyPrice:   m.monthlyPrice,
              classLimit:     m.planConfig?.classLimit ?? 0,
              membershipType: m.membershipType,
            },
          },
        });
        console.log(`[user-repository] Plan futuro registrado en MembershipRenewal (scheduled) para user ${id}`);
      } else {
        // Plan inmediato → upsert normal en UserMembership
        const upsertData = membershipToUpsertData(m, orgId);
        await this.prisma.userMembership.upsert({
          where:  { userId: id },
          create: { userId: id, ...upsertData },
          update: upsertData,
        });
      }
    }

    // Re-fetch con relación
    const updated = await this.prisma.user.findUnique({
      where:   { id },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },
    });
    return this.mapToEntity(updated!);
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async delete(id: string): Promise<FitCenterUserProfile> {
    // Leer antes de borrar para poder retornar el entity (CASCADE borra UserMembership)
    const toDelete = await this.prisma.user.findUnique({
      where:   { id },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },
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
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },    // ← HAL-01
    });
    return user ? this.mapToEntity(user) : null;
  }

  // ── findByRole ────────────────────────────────────────────────────────────
  async findByRole(role: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where:   { role },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },    // ← HAL-01
    });
    return users.map((u) => this.mapToEntity(u));
  }

  // ── findByMembershipStatus ────────────────────────────────────────────────
  // ANTES: membership: { path: ["status"], equals: status } → Full Table Scan JSONB
  // AHORA: userMembership: { status }                       → índice btree O(log n)
  async findByMembershipStatus(status: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where:   { userMembership: { status } },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },
    });
    return users.map((u) => this.mapToEntity(u));
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
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },
    });
    if (!user) throw new Error("User not found");
    if (!user.userMembership) throw new Error("UserMembership not found for user");

    // HAL-01 Fase 4 Sprint 4: Dual-write JSONB eliminado.
    // Solo se actualiza UserMembership (tabla relacional).
    await this.prisma.userMembership.update({
      where: { userId },
      data:  { status },
    });

    const updated = await this.prisma.user.findUnique({
      where:   { id: userId },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } } },
    });
    return this.mapToEntity(updated!);
  }

  // ── mapToEntity ───────────────────────────────────────────────────────────
  // HAL-01 Fase 4 Sprint 4: Lee exclusivamente desde userMembership (tabla relacional).
  // El fallback JSONB fue eliminado — la columna membership se dropeará en Sprint 4.
  private mapToEntity(prismaUser: UserWithMembership): FitCenterUserProfile {
    const membership = prismaUser.userMembership
      ? mapUserMembershipRow(prismaUser.userMembership)
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
      membership:       membership as import("../../types").FitCenterUserProfile["membership"],
      membershipRenewals: prismaUser.membershipRenewals,
    } as FitCenterUserProfile;
  }
}