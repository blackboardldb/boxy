import { UserRepository as IUserRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { FitCenterUserProfile, FitCenterMembership, MembershipStatus } from "../../types";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";
import { toMidnightUTC, toDateString } from "../../utils/dates";

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

// ─── Helper: Date | string → "YYYY-MM-DD" ────────────────────────────────────
// Re-exportado desde lib/utils/dates para compatibilidad interna.
const toDateStr = toDateString;

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
    // Normalizar a medianoche UTC para que el timestamp guardado en DB sea
    // invariante entre entornos (desarrollo UTC-4 vs Vercel UTC+0).
    startDate:          toMidnightUTC(m.startDate ?? m.currentPeriodStart),
    currentPeriodStart: toMidnightUTC(m.currentPeriodStart),
    currentPeriodEnd:   toMidnightUTC(m.currentPeriodEnd),
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

// ─── Helper: promoción scheduled → active ────────────────────────────────────
// Centraliza la lógica que antes vivía solo en /api/me.
// Se ejecuta en findUnique para que admin y alumno siempre vean el estado real.
// Costo: 0 escrituras si no hay nada que promover.
async function promoteScheduledIfReady(
  userId: string,
  userMembership: UserWithMembership["userMembership"],
  membershipRenewals: UserWithMembership["membershipRenewals"]
): Promise<UserWithMembership["userMembership"]> {
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
  }).format(now);
  const todayDate = new Date(today + "T00:00:00");

  // Camino 1: MembershipRenewal con status='scheduled' cuya startDate ya llegó
  const scheduledRenewal = (membershipRenewals ?? []).find((r) => {
    if (r.status !== "scheduled") return false;
    const details = r.renewalDetails as Record<string, unknown> | null;
    if (!details?.startDate) return false;
    return new Date((details.startDate as string) + "T00:00:00") <= todayDate;
  });

  if (scheduledRenewal) {
    const details = scheduledRenewal.renewalDetails as Record<string, unknown>;
    if (!userMembership?.organizationId) throw new Error("organizationId is required for promotion");

    const promotionData = {
      organizationId:     userMembership.organizationId,
      planId:             scheduledRenewal.requestedPlanId ?? null,
      status:             "active",
      startDate:          details.startDate ? new Date(details.startDate as string) : null,
      currentPeriodStart: details.startDate ? new Date(details.startDate as string) : null,
      currentPeriodEnd:   details.endDate   ? new Date(details.endDate   as string) : null,
      monthlyPrice:       (details.monthlyPrice as number)      ?? null,
      membershipType:     (details.membershipType as string)    ?? null,
      classLimit:         (details.classLimit as number)        ?? 0,
    };

    const promoted = await prisma.userMembership.upsert({
      where:  { userId },
      create: { userId, ...promotionData },
      update: promotionData,
    });

    await prisma.membershipRenewal.update({
      where: { id: scheduledRenewal.id },
      data:  {
        status: "approved",
        processedAt: now,
        // Persistir startDate relacional para que periodsCompleted en /api/users/[id]/stats lo cuente
        // (el filtro excluye renewals con startDate IS NULL)
        startDate: details.startDate ? new Date((details.startDate as string) + "T00:00:00") : null,
      },
    });

    console.log(
      `[user-repository] MembershipRenewal promoted → active for user ${userId} (renewal ${scheduledRenewal.id})`
    );
    return promoted;
  }

  // Camino 2 (legacy): UserMembership con status='scheduled' cuya fecha ya llegó
  if (userMembership?.status === "scheduled") {
    const startDateStr = userMembership.currentPeriodStart ?? userMembership.startDate;
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const isReady =
      startDate !== null &&
      todayDate >= new Date(startDate.toISOString().split("T")[0] + "T00:00:00");

    if (isReady) {
      const promoted = await prisma.userMembership.update({
        where: { userId },
        data:  { status: "active" },
      });
      console.log(
        `[user-repository] UserMembership (legacy) promoted → active for user ${userId}`
      );

      // Crear renewal approved si no existe (Flujo 2)
      // Normalizar a medianoche UTC para comparación exacta (evita offset UTC/local)
      const startDateNormalized = toMidnightUTC(startDate)!;

      const existingRenewal = await prisma.membershipRenewal.findFirst({
        where: {
          userId,
          organizationId: promoted.organizationId,  // scope al centro
          status: { in: ['approved', 'superseded'] },
          startDate: startDateNormalized,
        }
      });

      if (existingRenewal?.status === 'approved') {
        // Ya existe un renewal aprobado para este período — actualizarlo
        await prisma.membershipRenewal.update({
          where: { id: existingRenewal.id },
          data: {
            requestedPlanId: promoted.planId ?? null,
            currentPlanId:   promoted.planId ?? null,
            amount:          promoted.monthlyPrice,
            startDate:       startDateNormalized,
            renewalDetails: {
              requestedPlanName:       promoted.membershipType,
              requestedPlanPrice:      promoted.monthlyPrice,
              requestedPlanClassLimit: promoted.classLimit,
              requestedPlanDuration:   1,
              startDate: toDateString(startDateNormalized),
            }
          }
        });
        console.log(`[user-repository] Renewal updated (legacy promotion) for user ${userId}`);
      } else if (!existingRenewal) {
        // No existe ninguno para este período — crear
        await prisma.membershipRenewal.create({
          data: {
            userId,
            organizationId: promoted.organizationId,
            status: 'approved',
            requestedPlanId: promoted.planId ?? null,
            currentPlanId: promoted.planId ?? null,
            startDate: startDateNormalized,
            processedAt: new Date(),
            amount: promoted.monthlyPrice,
            renewalDetails: {
              requestedPlanName:       promoted.membershipType,
              requestedPlanPrice:      promoted.monthlyPrice,
              requestedPlanClassLimit: promoted.classLimit,
              requestedPlanDuration:   1,
              startDate: toDateString(startDateNormalized),
            }
          }
        });
        console.log(`[user-repository] Renewal created automatically for legacy promoted plan user ${userId}`);
      }

      return promoted;
    }
  }

  // Sin cambios — retorna lo que llegó
  return userMembership;
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

    // Soft delete: excluir usuarios eliminados de todos los listados.
    const where = { ...params?.where, deletedAt: null };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: params?.orderBy,
        take:    limit,
        skip,
        include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
      }),
      this.prisma.user.count({ where }),
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
      include: {
        userMembership: true,
        memberships: true,
        membershipRenewals: {
          where:   { status: { in: ["pending", "scheduled"] } }, // OPT-01: solo accionables
          orderBy: { requestedAt: "desc" },
        },
      },
    });
    if (!user) return null;

    // BUG-02 Propuesta A: promover scheduled → active antes de mapear.
    // Si no hay nada que promover, esta función retorna sin escribir en DB.
    user.userMembership = await promoteScheduledIfReady(
      user.id,
      user.userMembership,
      user.membershipRenewals
    );

    return this.mapToEntity(user);
  }

  // ── create ────────────────────────────────────────────────────────────────
  // Dual-write Phase 3: escribe en JSONB (backward-compat) Y en UserMembership.
  // El JSONB se elimina en Phase 4.
  async create(data: CreateData<FitCenterUserProfile>): Promise<FitCenterUserProfile> {
    const orgId = data.organizationId;
    if (!orgId) throw new Error("organizationId is required");

    const created = await this.prisma.user.create({
      data: {
        id:               data.id,
        firstName:        data.firstName,
        lastName:         data.lastName,
        email:            data.email,
        authId:           (data as any).authId ?? null,  // UUID de Supabase Auth
        phone:            data.phone ?? undefined,
        gender:           data.gender           ?? undefined,
        dateOfBirth:      data.dateOfBirth       ? new Date(data.dateOfBirth) : undefined,
        emergencyContact: data.emergencyContact  ?? undefined,
      },
    });

    // Crear OrganizationMember
    await this.prisma.organizationMember.create({
      data: {
        userId: created.id,
        organizationId: orgId,
        role: (data.role?.toUpperCase() || "ALUMNO") as import("@prisma/client").MemberRole,
        formaDePago: data.formaDePago ?? undefined,
        status: "active",
      }
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
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    return this.mapToEntity(withMembership as any);
  }

  // ── update ────────────────────────────────────────────────────────────────
  // Dual-write Phase 3: actualiza JSONB + upsert en UserMembership.
  async update(id: string, data: UpdateData<FitCenterUserProfile>): Promise<FitCenterUserProfile> {
    const existing = await this.prisma.user.findUnique({
      where:  { id },
      include: { memberships: true, userMembership: true },
    });
    const orgId = existing?.memberships[0]?.organizationId;
    if (!orgId) throw new Error("organizationId is required");

    await this.prisma.user.update({
      where: { id },
      data: {
        firstName:        data.firstName,
        lastName:         data.lastName,
        email:            data.email,
        phone:            data.phone       ?? undefined,
        gender:           data.gender,
        dateOfBirth:      data.dateOfBirth  ? new Date(data.dateOfBirth) : undefined,
        emergencyContact: data.emergencyContact,
      },
    });

    if (orgId && (data.role || data.formaDePago)) {
      const om = existing?.memberships.find(m => m.organizationId === orgId);
      if (om) {
        await this.prisma.organizationMember.update({
          where: { id: om.id },
          data: {
            role: (data.role ? data.role.toUpperCase() : undefined) as import("@prisma/client").MemberRole | undefined,
            formaDePago: data.formaDePago,
          }
        });
      }
    }

    // Si viene membership en el payload, bifurcar según fecha de inicio:
    //   Fecha futura  → crear MembershipRenewal { status: 'scheduled' } — NO tocar UserMembership
    //   Fecha hoy/pasada → upsert normal en UserMembership
    if (data.membership) {
      const m = data.membership as any;

      // Normalizar startDate a medianoche UTC — invariante entre entornos.
      // Esto garantiza que el timestamp guardado en DB y el usado en búsquedas
      // sean idénticos sin importar la zona horaria del servidor.
      const startDate = toMidnightUTC(m.currentPeriodStart);

      const today = toMidnightUTC(new Date())!;
      const isScheduledPlan = startDate !== null && startDate > today;

      if (isScheduledPlan) {
        // Plan futuro → staging en MembershipRenewal (UserMembership no se toca)
        await this.prisma.membershipRenewal.create({
          data: {
            userId: id,
            organizationId: orgId,
            currentPlanId:   m.planId ?? null,
            requestedPlanId: m.planId ?? null,
            status:          'scheduled',
            paymentMethod:   (data as any).formaDePago ?? null,
            renewalDetails: {
              startDate:      toDateString(startDate),
              endDate:        toDateString(m.currentPeriodEnd),
              monthlyPrice:   m.monthlyPrice,
              classLimit:     m.planConfig?.classLimit ?? 0,
              membershipType: m.membershipType,
            },
          },
        });
        console.log(`[user-repository] Plan futuro registrado en MembershipRenewal (scheduled) para user ${id}`);
      } else {
        // Plan inmediato → upsert en UserMembership
        const upsertData = membershipToUpsertData(m, orgId);
        await this.prisma.userMembership.upsert({
          where:  { userId: id },
          create: { userId: id, ...upsertData },
          update: upsertData,
        });

        // ── Lógica de renewal: upsert por (userId, organizationId, startDate) ──
        //
        // REGLA DE NEGOCIO: Editar cualquier campo del plan vigente sobreescribe
        // el registro existente. Solo se crea uno nuevo si no existe ninguno
        // para este período + centro.
        //
        // skipAutomaticRenewal: enviado por /nuevo-plan cuando el renewal ya fue
        // creado explícitamente via POST /renewal. Evita el doble registro.
        const shouldRegisterPayment =
          (data as any).registerPayment !== false &&
          !(data as any).skipAutomaticRenewal;

        if (m.status === 'active' && startDate && shouldRegisterPayment) {
          // Buscar renewal existente con clave exacta (userId, organizationId, startDate)
          // incluyendo 'superseded' para poder reactivarlo si fue marcado antes.
          const existingRenewal = await this.prisma.membershipRenewal.findFirst({
            where: {
              userId: id,
              organizationId: orgId,   // ← scope al centro — nunca buscar sin esto
              status: { in: ['approved', 'superseded'] },
              startDate,               // comparación exacta con valor normalizado
            },
          });

          if (existingRenewal) {
            // Existe → actualizar. Nunca crear un duplicado.
            await this.prisma.membershipRenewal.update({
              where: { id: existingRenewal.id },
              data: {
                status:          'approved',
                requestedPlanId: m.planId ?? null,
                currentPlanId:   m.planId ?? null,
                startDate,
                processedAt:     new Date(),
                paymentMethod:   (data as any).formaDePago ?? existingRenewal.paymentMethod,
                amount:          typeof m.monthlyPrice === 'number' ? m.monthlyPrice : null,
                renewalDetails: {
                  membershipType: m.membershipType,
                  monthlyPrice:   m.monthlyPrice,
                  classLimit:     m.planConfig?.classLimit ?? 0,
                  startDate:      toDateString(startDate),
                  endDate:        toDateString(m.currentPeriodEnd),
                },
              },
            });
            console.log(`[user-repository] Renewal updated (upsert) for user ${id}, orgId ${orgId}`);
          } else {
            // No existe para este período + centro → crear
            await this.prisma.membershipRenewal.create({
              data: {
                userId: id,
                organizationId: orgId,
                status:          'approved',
                requestedPlanId: m.planId ?? null,
                currentPlanId:   m.planId ?? null,
                startDate,
                processedAt:     new Date(),
                paymentMethod:   (data as any).formaDePago ?? null,
                amount:          typeof m.monthlyPrice === 'number' ? m.monthlyPrice : null,
                renewalDetails: {
                  membershipType: m.membershipType,
                  monthlyPrice:   m.monthlyPrice,
                  classLimit:     m.planConfig?.classLimit ?? 0,
                  startDate:      toDateString(startDate),
                  endDate:        toDateString(m.currentPeriodEnd),
                },
              },
            });
            console.log(`[user-repository] Renewal created for user ${id}, orgId ${orgId}`);
          }
        }
      }
    }

    // Re-fetch con relación
    const updated = await this.prisma.user.findUnique({
      where:   { id },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    return this.mapToEntity(updated as any);
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async delete(id: string): Promise<FitCenterUserProfile> {
    const toDelete = await this.prisma.user.findUnique({
      where:   { id },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    if (!toDelete) throw new Error(`User ${id} not found`);
    const entity = this.mapToEntity(toDelete);

    await this.prisma.user.delete({ where: { id } });
    return entity;
  }

  // ── softDelete ────────────────────────────────────────────────────────────
  async softDelete(id: string): Promise<FitCenterUserProfile> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    const withMembership = await this.prisma.user.findUnique({
      where:   { id },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    return this.mapToEntity(withMembership as any);
  }

  // ── count ─────────────────────────────────────────────────────────────────
  async count(params: CountParams = {}): Promise<number> {
    // Soft delete: los usuarios eliminados no cuentan.
    return this.prisma.user.count({ where: { ...params?.where, deletedAt: null } });
  }

  // ── findByEmail ───────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<FitCenterUserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where:   { email },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findByRole(role: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where:   { memberships: { some: { role: role.toUpperCase() as import("@prisma/client").MemberRole } }, deletedAt: null },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    return users.map((u) => this.mapToEntity(u));
  }

  // ── findByMembershipStatus ────────────────────────────────────────────────
  // ANTES: membership: { path: ["status"], equals: status } → Full Table Scan JSONB
  // AHORA: userMembership: { status }                       → índice btree O(log n)
  async findByMembershipStatus(status: string): Promise<FitCenterUserProfile[]> {
    const users = await this.prisma.user.findMany({
      where:   { userMembership: { status }, deletedAt: null },
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    return users.map((u) => this.mapToEntity(u));
  }

  // ── getUserStats ──────────────────────────────────────────────────────────
  // ANTES: 5 queries separadas con JSONB path → 5 Full Table Scans
  // AHORA: 1 groupBy en UserMembership           → 1 query con índice btree
  async getUserStats(organizationId?: string): Promise<{
    total: number; active: number; pending: number;
    expired: number; inactive: number; frozen: number;
  }> {
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    } else {
      throw new Error("organizationId is required");
    }

    const results = await this.prisma.userMembership.groupBy({
      by:    ["status"],
      where,
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
      include: { userMembership: true, membershipRenewals: { orderBy: { requestedAt: 'desc' } }, memberships: true },
    });
    return this.mapToEntity(updated as any);
  }

  // ── mapToEntity ───────────────────────────────────────────────────────────
  // HAL-01 Fase 4 Sprint 4: Lee exclusivamente desde userMembership (tabla relacional).
  // El fallback JSONB fue eliminado — la columna membership se dropeará en Sprint 4.
  private mapToEntity(prismaUser: any): FitCenterUserProfile {
    const membership = prismaUser.userMembership
      ? mapUserMembershipRow(prismaUser.userMembership)
      : undefined;

    const orgMember = prismaUser.memberships?.[0];

    return {
      id:               prismaUser.id,
      firstName:        prismaUser.firstName,
      lastName:         prismaUser.lastName,
      email:            prismaUser.email,
      authId:           prismaUser.authId ?? null,
      phone:            prismaUser.phone,
      role:             orgMember?.role?.toLowerCase() || "user",
      organizationId:   orgMember?.organizationId || "",
      gender:           prismaUser.gender           ?? undefined,
      dateOfBirth:      prismaUser.dateOfBirth
        ? new Date(prismaUser.dateOfBirth).toISOString().split("T")[0]
        : undefined,
      emergencyContact: prismaUser.emergencyContact ?? undefined,
      formaDePago:      orgMember?.formaDePago      ?? undefined,
      membership:       membership as import("../../types").FitCenterUserProfile["membership"],
      membershipRenewals: prismaUser.membershipRenewals,
    } as FitCenterUserProfile;
  }
}