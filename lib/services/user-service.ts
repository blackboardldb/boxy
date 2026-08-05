// lib/services/user-service.ts
// Migrado (Bloque 1 — Prisma Provider): ya no extiende BaseService ni pasa
// por PrismaUserRepository. Prisma directo. promoteScheduledIfReady y el
// resto de la lógica de dominio de membresía viven acá (antes en el repo).

import { prisma } from "../prisma";
import { Prisma, MemberRole } from "@prisma/client";
import { FitCenterUserProfile, FitCenterMembership, MembershipStatus } from "../types";
import { ApiResponse, PaginatedApiResponse, createSuccessResponse, createPaginatedResponse } from "../api/types";
import { ValidationError, NotFoundError } from "../errors/types";
import { withErrorHandling } from "../errors/handler";
import { updateSchemas, validateWithSchema } from "../types/generator";
import { deleteAuthUser } from "../supabase/admin";
import { toMidnightUTC, toDateString } from "../utils/dates";
import * as Sentry from "@sentry/nextjs";

type UserWithMembership = Prisma.UserGetPayload<{
  include: { userMembership: true; membershipRenewals: true; memberships: true };
}>;
type SingleUserMembership = UserWithMembership["userMembership"][number];

// ─── Helpers de dominio (portados 1:1 desde user-repository.ts) ────────────

function mapUserMembershipRow(um: SingleUserMembership): FitCenterMembership | undefined {
  if (!um) return undefined;
  const toISODate = (d: Date | null | undefined): string =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  return {
    id: `${um.userId}_${um.organizationId}`,
    organizationId: um.organizationId,
    organizationName: "",
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
    centerStats: {
      currentMonth: {
        classesAttended: 0,
        classesContracted: um.classLimit,
        remainingClasses: um.classLimit,
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

function membershipToUpsertData(m: any, organizationId: string) {
  const safePlanId = (v: string | null | undefined): string | null =>
    v && v.trim() !== "" ? v : null;

  return {
    organizationId,
    planId: safePlanId(m.planId),
    status: m.status || "inactive",
    startDate: toMidnightUTC(m.startDate ?? m.currentPeriodStart),
    currentPeriodStart: toMidnightUTC(m.currentPeriodStart),
    currentPeriodEnd: toMidnightUTC(m.currentPeriodEnd),
    monthlyPrice: typeof m.monthlyPrice === "number" ? m.monthlyPrice : null,
    membershipType: m.membershipType?.trim() || null,
    classLimit: typeof m.planConfig?.classLimit === "number" ? m.planConfig.classLimit : 0,
    disciplineAccess: m.planConfig?.disciplineAccess === "limited" ? "limited" : "all",
    allowedDisciplines: Array.isArray(m.planConfig?.allowedDisciplines) ? m.planConfig.allowedDisciplines : [],
    canFreeze: m.planConfig?.canFreeze === true,
    freezeDurationDays: typeof m.planConfig?.freezeDurationDays === "number" ? m.planConfig.freezeDurationDays : 0,
    autoRenews: m.planConfig?.autoRenews === true,
    allowCancellation: m.centerConfig?.allowCancellation !== false,
    cancellationHours: typeof m.centerConfig?.cancellationHours === "number" ? m.centerConfig.cancellationHours : 6,
    maxBookingsPerDay: typeof m.centerConfig?.maxBookingsPerDay === "number" ? m.centerConfig.maxBookingsPerDay : 3,
    autoWaitlist: m.centerConfig?.autoWaitlist !== false,
  };
}

async function promoteScheduledIfReady(
  userId: string,
  userMembership: SingleUserMembership | undefined,
  membershipRenewals: UserWithMembership["membershipRenewals"]
): Promise<SingleUserMembership | undefined> {
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(now);
  const todayDate = new Date(today + "T00:00:00");

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
      organizationId: userMembership.organizationId,
      planId: scheduledRenewal.requestedPlanId ?? null,
      status: "active",
      startDate: details.startDate ? new Date(details.startDate as string) : null,
      currentPeriodStart: details.startDate ? new Date(details.startDate as string) : null,
      currentPeriodEnd: details.endDate ? new Date(details.endDate as string) : null,
      monthlyPrice: (details.monthlyPrice as number) ?? null,
      membershipType: (details.membershipType as string) ?? null,
      classLimit: (details.classLimit as number) ?? 0,
    };

    const promoted = await prisma.userMembership.upsert({
      where: { userId_organizationId: { userId, organizationId: userMembership.organizationId } },
      create: { userId, ...promotionData },
      update: promotionData,
    });

    await prisma.membershipRenewal.update({
      where: { id: scheduledRenewal.id },
      data: {
        status: "approved",
        processedAt: now,
        startDate: details.startDate ? new Date((details.startDate as string) + "T00:00:00") : null,
      },
    });

    console.log(`[user-service] MembershipRenewal promoted → active for user ${userId} (renewal ${scheduledRenewal.id})`);
    return promoted;
  }

  if (userMembership?.status === "scheduled") {
    const startDateStr = userMembership.currentPeriodStart ?? userMembership.startDate;
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const isReady = startDate !== null && todayDate >= new Date(startDate.toISOString().split("T")[0] + "T00:00:00");

    if (isReady) {
      const promoted = await prisma.userMembership.update({
        where: { userId_organizationId: { userId, organizationId: userMembership.organizationId } },
        data: { status: "active" },
      });
      console.log(`[user-service] UserMembership (legacy) promoted → active for user ${userId}`);

      const startDateNormalized = toMidnightUTC(startDate)!;
      const existingRenewal = await prisma.membershipRenewal.findFirst({
        where: {
          userId,
          organizationId: promoted.organizationId,
          status: { in: ["approved", "superseded"] },
          startDate: startDateNormalized,
        },
      });

      if (existingRenewal?.status === "approved") {
        await prisma.membershipRenewal.update({
          where: { id: existingRenewal.id },
          data: {
            requestedPlanId: promoted.planId ?? null,
            currentPlanId: promoted.planId ?? null,
            amount: promoted.monthlyPrice,
            startDate: startDateNormalized,
            renewalDetails: {
              requestedPlanName: promoted.membershipType,
              requestedPlanPrice: promoted.monthlyPrice,
              requestedPlanClassLimit: promoted.classLimit,
              requestedPlanDuration: 1,
              startDate: toDateString(startDateNormalized),
            },
          },
        });
      } else if (!existingRenewal) {
        await prisma.membershipRenewal.create({
          data: {
            userId,
            organizationId: promoted.organizationId,
            status: "approved",
            requestedPlanId: promoted.planId ?? null,
            currentPlanId: promoted.planId ?? null,
            startDate: startDateNormalized,
            processedAt: new Date(),
            amount: promoted.monthlyPrice,
            renewalDetails: {
              requestedPlanName: promoted.membershipType,
              requestedPlanPrice: promoted.monthlyPrice,
              requestedPlanClassLimit: promoted.classLimit,
              requestedPlanDuration: 1,
              startDate: toDateString(startDateNormalized),
            },
          },
        });
      }
      return promoted;
    }
  }
  return userMembership;
}

function mapToEntity(prismaUser: any, targetOrganizationId?: string): FitCenterUserProfile {
  // Si se provee targetOrganizationId, seleccionamos la membresía de ese centro.
  // Si no, usamos [0] — solo válido en contextos globales donde ya sabemos que hay exactamente una.
  let umRaw;
  if (Array.isArray(prismaUser.userMembership)) {
    umRaw = targetOrganizationId
      ? prismaUser.userMembership.find((m: any) => m.organizationId === targetOrganizationId)
      : prismaUser.userMembership[0];
  } else {
    umRaw = prismaUser.userMembership;
  }
  const membership = umRaw ? mapUserMembershipRow(umRaw) : undefined;

  // Mismo criterio para el org_member (role, formaDePago, etc.)
  let orgMember;
  if (Array.isArray(prismaUser.memberships)) {
    orgMember = targetOrganizationId
      ? prismaUser.memberships.find((m: any) => m.organizationId === targetOrganizationId)
      : prismaUser.memberships[0];
  } else {
    orgMember = prismaUser.memberships?.[0];
  }

  return {
    id: prismaUser.id,
    firstName: prismaUser.firstName,
    lastName: prismaUser.lastName,
    email: prismaUser.email,
    authId: prismaUser.authId ?? null,
    phone: prismaUser.phone,
    role: orgMember?.role?.toLowerCase() || "user",
    organizationId: orgMember?.organizationId || "",
    gender: prismaUser.gender ?? undefined,
    dateOfBirth: prismaUser.dateOfBirth ? new Date(prismaUser.dateOfBirth).toISOString().split("T")[0] : undefined,
    emergencyContact: prismaUser.emergencyContact ?? undefined,
    formaDePago: orgMember?.formaDePago ?? undefined,
    membership: membership as FitCenterUserProfile["membership"],
    membershipRenewals: prismaUser.membershipRenewals,
  } as FitCenterUserProfile;
}

// ─── Cache en memoria — keys ahora incluyen organizationId cuando aplica ────
// (mismo caveat que antes: no persiste entre workers serverless de forma confiable)
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

async function withCache<R>(key: string, operation: () => Promise<R>, ttlMs = 5 * 60 * 1000): Promise<R> {
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < cached.ttl) return cached.data as R;
  const result = await operation();
  cache.set(key, { data: result, timestamp: now, ttl: ttlMs });
  return result;
}

function clearCache(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}

// ─── Servicio ────────────────────────────────────────────────────────────

export class UserService {
  // Reemplaza provider.users.findUnique(where, orgId). Lo usan otros
  // servicios (ej. class-service) para resolver un usuario dentro de un
  // centro específico + disparar promoción de membresía.
  async getUserScopedToOrg(userId: string, organizationId: string): Promise<FitCenterUserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userMembership: { where: { organizationId } },
        memberships: true,
        membershipRenewals: { where: { organizationId, status: { in: ["pending", "scheduled"] } }, orderBy: { requestedAt: "desc" } },
      },
    });
    if (!user) return null;

    const umRaw = Array.isArray(user.userMembership) ? user.userMembership[0] : user.userMembership;
    const promoted = await promoteScheduledIfReady(user.id, umRaw, user.membershipRenewals);
    if (promoted !== umRaw) (user as any).userMembership = [promoted];

    // Pasamos organizationId para que mapToEntity no use [0] arbitrario
    return mapToEntity(user, organizationId);
  }

  // Scope global intencional (cross-tenant) — solo para soft delete y casos
  // donde se necesita saber si el usuario tiene membresía en cualquier centro.
  async getUserGlobalScope(userId: string): Promise<FitCenterUserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userMembership: true,
        memberships: true,
        membershipRenewals: { where: { status: { in: ["pending", "scheduled"] } }, orderBy: { requestedAt: "desc" } },
      },
    });
    return user ? mapToEntity(user) : null;
  }

  async getUserById(id: string, organizationId: string): Promise<ApiResponse<FitCenterUserProfile | null>> {
    return withErrorHandling(
      async () => {
        // Una sola query: trae el usuario con memberships (para el guard de pertenencia
        // via organization_members) y userMembership filtrado por org (para mapToEntity
        // sin [0] arbitrario). Patrón idéntico al guard de deleteUser (L585-596).
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            userMembership: { where: { organizationId } },
            memberships: true,
            membershipRenewals: {
              where: { organizationId, status: { in: ["pending", "scheduled"] } },
              orderBy: { requestedAt: "desc" },
            },
          },
        });

        if (!user) return createSuccessResponse(null);

        // Guard de pertenencia: verifica organization_members, NO userMembership (plan).
        // Un alumno sin plan activo puede pertenecer legítimamente a un centro
        // (recién registrado, membresía vencida, staff sin plan, etc.).
        const belongsToOrg = user.memberships.some((m) => m.organizationId === organizationId);
        if (!belongsToOrg) return createSuccessResponse(null);

        return createSuccessResponse(mapToEntity(user, organizationId));
      },
      { operation: "getUserById", resource: "users", metadata: { id } }
    );
  }

  // ⚠️ Mismo caveat que /api/me (BUG-09): sin organizationId, si el usuario
  // pertenece a 2+ centros, puede devolver la membresía del centro equivocado.
  // Pasar organizationId siempre que el caller lo tenga disponible.
  async getUserByEmail(email: string, organizationId?: string): Promise<ApiResponse<FitCenterUserProfile | null>> {
    const cacheKey = organizationId ? `user_email_${email}_${organizationId}` : `user_email_${email}`;
    return withCache(cacheKey, async () => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userMembership: organizationId ? { where: { organizationId } } : true,
          membershipRenewals: organizationId ? { where: { organizationId }, orderBy: { requestedAt: "desc" } } : { orderBy: { requestedAt: "desc" } },
          memberships: true,
        },
      });
      return createSuccessResponse(user ? mapToEntity(user, organizationId) : null);
    });
  }

  async getUsers(params?: {
    page?: number; limit?: number; search?: string; role?: string; status?: string; organizationId?: string;
  }): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const conditions: any[] = [{ deletedAt: null }];

    if (params?.organizationId || params?.role) {
      conditions.push({
        memberships: {
          some: {
            ...(params.organizationId && { organizationId: params.organizationId }),
            ...(params.role && { role: params.role === "user" ? "ALUMNO" : params.role.toUpperCase() }),
          },
        },
      });
    }

    if (params?.status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const orgFilter = params.organizationId ? { organizationId: params.organizationId } : {};

      if (params.status === "active") {
        conditions.push({ userMembership: { some: { ...orgFilter, currentPeriodEnd: { gte: today }, status: { notIn: ["inactive", "suspended", "expired"] } } } });
      } else if (params.status === "scheduled") {
        conditions.push({ userMembership: { some: { ...orgFilter, currentPeriodStart: { gt: today } } } });
      } else if (params.status === "pending") {
        conditions.push({ userMembership: { some: { ...orgFilter, status: "pending" } } });
      } else if (params.status === "inactive") {
        conditions.push({
          OR: [
            { userMembership: { none: { ...orgFilter } } },
            { userMembership: { some: { ...orgFilter, status: { in: ["inactive", "suspended", "expired"] } } } },
            { userMembership: { some: { ...orgFilter, currentPeriodEnd: { lt: today }, status: { notIn: ["pending", "scheduled"] } } } },
          ],
        });
      } else {
        conditions.push({ userMembership: { some: { ...orgFilter, status: params.status } } });
      }
    }

    if (params?.search) {
      conditions.push({
        OR: [
          { firstName: { contains: params.search, mode: "insensitive" } },
          { lastName: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
        ],
      });
    }

    const where = { AND: conditions };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip,
        include: { 
          userMembership: params?.organizationId ? { where: { organizationId: params.organizationId } } : true, 
          membershipRenewals: params?.organizationId ? { where: { organizationId: params.organizationId }, orderBy: { requestedAt: "desc" } } : { orderBy: { requestedAt: "desc" } }, 
          memberships: true 
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return createPaginatedResponse(users.map((u) => mapToEntity(u, params?.organizationId)), {
      page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1,
    });
  }

  async createUser(data: any): Promise<ApiResponse<FitCenterUserProfile>> {
    return withErrorHandling(async () => {
      await validateCreateData(data);
      const orgId = data.organizationId;
      if (!orgId) throw new ValidationError("organizationId is required");

      const created = await prisma.user.create({
        data: {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.toLowerCase(),
          authId: data.authId ?? null,
          phone: data.phone ?? undefined,
          gender: data.gender ?? undefined,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          emergencyContact: data.emergencyContact ?? undefined,
        },
      });

      await prisma.organizationMember.create({
        data: {
          userId: created.id,
          organizationId: orgId,
          role: (data.role?.toUpperCase() || "ALUMNO") as MemberRole,
          formaDePago: data.formaDePago ?? undefined,
          status: "active",
        },
      });

      if (data.membership) {
        await prisma.userMembership.upsert({
          where: { userId_organizationId: { userId: created.id, organizationId: orgId } },
          create: { userId: created.id, ...membershipToUpsertData(data.membership, orgId) },
          update: {},
        });
      }

      const withMembership = await prisma.user.findUnique({
        where: { id: created.id },
        include: { 
          userMembership: { where: { organizationId: orgId } }, 
          membershipRenewals: { where: { organizationId: orgId }, orderBy: { requestedAt: "desc" } }, 
          memberships: true 
        },
      });

      clearCache();
      console.log(`[UserService] User created: ${created.id} (${created.email})`);
      return createSuccessResponse(mapToEntity(withMembership, orgId));
    }, { operation: "createUser", resource: "users" });
  }

  async updateUser(id: string, data: any, organizationId: string): Promise<ApiResponse<FitCenterUserProfile>> {
    return withErrorHandling(async () => {
      const existing = await prisma.user.findUnique({
        where: { id },
        include: { memberships: true, userMembership: true },
      });
      if (!existing) throw new NotFoundError("User", id);

      // MT-07: Validar pertenencia al tenant antes de cualquier escritura.
      // Usamos 404 intencionalmente (indistinguible entre "no existe" y "existe en otro tenant").
      const belongsToOrg = existing.memberships.some((m) => m.organizationId === organizationId);
      if (!belongsToOrg) throw new NotFoundError("User", id);

      await validateUpdateData(id, data, mapToEntity(existing, organizationId));

      const orgId = organizationId;

      await prisma.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email ? data.email.toLowerCase() : undefined,
          phone: data.phone ?? undefined,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          emergencyContact: data.emergencyContact,
        },
      });

      if (data.role || data.formaDePago) {
        const om = existing.memberships.find((m) => m.organizationId === orgId);
        if (om) {
          await prisma.organizationMember.update({
            where: { id: om.id },
            data: {
              role: data.role ? (data.role.toUpperCase() as MemberRole) : undefined,
              formaDePago: data.formaDePago,
            },
          });
        }
      }

      if (data.membership) {
        const m = data.membership;
        const startDate = toMidnightUTC(m.currentPeriodStart);
        const today = toMidnightUTC(new Date())!;
        const isScheduledPlan = startDate !== null && startDate > today;
        const skipScheduled = !!data.skipAutomaticRenewal;

        if (isScheduledPlan && !skipScheduled) {
          await prisma.membershipRenewal.create({
            data: {
              userId: id,
              organizationId: orgId,
              currentPlanId: m.planId ?? null,
              requestedPlanId: m.planId ?? null,
              status: "scheduled",
              paymentMethod: data.formaDePago ?? null,
              startDate,
              renewalDetails: {
                startDate: toDateString(startDate),
                endDate: toDateString(m.currentPeriodEnd),
                monthlyPrice: m.monthlyPrice,
                classLimit: m.planConfig?.classLimit ?? 0,
                membershipType: m.membershipType,
              },
            },
          });
        } else {
          const upsertData = membershipToUpsertData(m, orgId);
          await prisma.userMembership.upsert({
            where: { userId_organizationId: { userId: id, organizationId: orgId } },
            create: { userId: id, ...upsertData },
            update: upsertData,
          });

          const shouldRegisterPayment = data.registerPayment !== false && !data.skipAutomaticRenewal;

          if (m.status === "active" && startDate && shouldRegisterPayment) {
            const existingRenewal = await prisma.membershipRenewal.findFirst({
              where: { userId: id, organizationId: orgId, status: { in: ["approved", "superseded"] }, startDate },
            });

            const renewalData = {
              status: "approved" as const,
              requestedPlanId: m.planId ?? null,
              currentPlanId: m.planId ?? null,
              startDate,
              processedAt: new Date(),
              paymentMethod: data.formaDePago ?? existingRenewal?.paymentMethod ?? null,
              amount: typeof m.monthlyPrice === "number" ? m.monthlyPrice : null,
              renewalDetails: {
                membershipType: m.membershipType,
                monthlyPrice: m.monthlyPrice,
                classLimit: m.planConfig?.classLimit ?? 0,
                startDate: toDateString(startDate),
                endDate: toDateString(m.currentPeriodEnd),
              },
            };

            if (existingRenewal) {
              await prisma.membershipRenewal.update({ where: { id: existingRenewal.id }, data: renewalData });
            } else {
              await prisma.membershipRenewal.create({ data: { userId: id, organizationId: orgId, ...renewalData } });
            }
          }
        }
      }

      const updated = await prisma.user.findUnique({
        where: { id },
        include: { 
          userMembership: { where: { organizationId: orgId } }, 
          membershipRenewals: { where: { organizationId: orgId }, orderBy: { requestedAt: "desc" } }, 
          memberships: true 
        },
      });

      clearCache();
      clearCache(`user_email_${updated!.email}`);
      return createSuccessResponse(mapToEntity(updated, orgId));
    }, { operation: "updateUser", resource: "users", metadata: { id } });
  }

  async deleteUser(id: string, organizationId: string): Promise<ApiResponse<FitCenterUserProfile>> {
    return withErrorHandling(async () => {
      // MT-07: Consulta directa a Prisma para tener acceso a memberships[] antes de mapear.
      // No usamos getUserScopedToOrg como guard porque no devuelve null cuando el usuario
      // existe pero no pertenece a la org — devuelve el objeto con membership: undefined.
      const existingPrismaUser = await prisma.user.findUnique({
        where: { id },
        include: {
          memberships: true,
          userMembership: { where: { organizationId } },
        },
      });
      if (!existingPrismaUser) throw new NotFoundError("User", id);

      // Guard de pertenencia al tenant
      const belongsToOrg = existingPrismaUser.memberships.some((m) => m.organizationId === organizationId);
      if (!belongsToOrg) throw new NotFoundError("User", id);

      // Evaluar membresía del centro correcto (ya filtrado en la query)
      const ownMembership = existingPrismaUser.userMembership[0];
      if (ownMembership?.status === "active") {
        throw new ValidationError("Cannot delete user with active membership. Please deactivate first.");
      }

      let shouldRevokeGlobalAuth = false;

      // MT-07: Transacción atómica para prevenir condición de carrera si dos centros
      // intentan eliminar al mismo usuario simultáneamente.
      await prisma.$transaction(async (tx) => {
        // 1. Inactivar la relación con ESTE centro únicamente
        await tx.userMembership.updateMany({
          where: { userId: id, organizationId },
          data: { status: "inactive", autoRenews: false },
        });
        await tx.organizationMember.updateMany({
          where: { userId: id, organizationId },
          data: { status: "inactive" },
        });

        // 2. Contar cuántos OTROS centros tiene activos (la escritura anterior ya está en esta tx)
        const activeOtherOrgsCount = await tx.organizationMember.count({
          where: {
            userId: id,
            organizationId: { not: organizationId },
            status: { not: "inactive" },
          },
        });

        // 3. Si no quedan otros centros, hacer el soft-delete global
        if (activeOtherOrgsCount === 0) {
          await tx.user.update({ where: { id }, data: { deletedAt: new Date() } });
          shouldRevokeGlobalAuth = true;
        }
      });

      // 4. Revocación de Auth (fuera de la transacción para no bloquear la BD esperando red).
      // DEUDA TÉCNICA (DT-01): Si deleteAuthUser falla aquí, la BD ya tiene deletedAt seteado
      // pero el usuario conserva credenciales de Auth activas. Riesgo preexistente antes de este fix.
      // Solución definitiva: Outbox Pattern o cola de reintentos (fuera del alcance de Bloque 5A).
      if (shouldRevokeGlobalAuth && existingPrismaUser.authId) {
        try {
          await deleteAuthUser(existingPrismaUser.authId);
        } catch (error) {
          Sentry.captureException(error, { extra: { userId: id, authId: existingPrismaUser.authId, action: "soft_delete_auth_revoke" } });
          console.error(`[UserService] ALERTA: Soft delete OK en BD, pero falló revocación en Supabase Auth para authId=${existingPrismaUser.authId}.`, error);
        }
      } else if (shouldRevokeGlobalAuth) {
        console.warn(`[UserService] Usuario ${id} sin authId — omitiendo revocación en Auth.`);
      } else {
        console.log(`[UserService] Usuario ${id} tiene otros centros activos — no se revoca Auth global.`);
      }

      const updatedUser = await this.getUserScopedToOrg(id, organizationId);
      if (!updatedUser) throw new NotFoundError("User", id);
      clearCache();
      clearCache(`user_email_${existingPrismaUser.email}`);
      console.log(`[UserService] Alumno eliminado del centro ${organizationId}: userId=${id} (${existingPrismaUser.email}). Global: ${shouldRevokeGlobalAuth}`);
      return createSuccessResponse(updatedUser);
    }, { operation: "deleteUser", resource: "users", metadata: { id } });
  }

  // organizationId ahora obligatorio — antes estos 5 métodos no scopeaban (BUG-06)
  async getUsersWithMembership(organizationId: string): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.queryByMembershipFilter(organizationId, { isNot: null });
  }

  async getActiveUsers(organizationId: string): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.queryByMembershipFilter(organizationId, { status: "active" });
  }

  async getUsersByMembershipStatus(status: string, organizationId: string): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.queryByMembershipFilter(organizationId, { status });
  }

  async getPendingUsers(organizationId: string): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.getUsersByMembershipStatus("pending", organizationId);
  }

  async getExpiredUsers(organizationId: string): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.getUsersByMembershipStatus("expired", organizationId);
  }

  // Simplificado a propósito (sin paginación real) — test data, ver nota arriba.
  private async queryByMembershipFilter(organizationId: string, userMembershipWhere: any): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { memberships: { some: { organizationId } } },
          { userMembership: userMembershipWhere },
          { deletedAt: null },
        ],
      },
      include: { 
        userMembership: { where: { organizationId } }, 
        membershipRenewals: { where: { organizationId }, orderBy: { requestedAt: "desc" } }, 
        memberships: true 
      },
    });
    const total = users.length;
    return createPaginatedResponse(users.map((u) => mapToEntity(u, organizationId)), {
      page: 1, limit: total || 1, total, totalPages: 1, hasNextPage: false, hasPrevPage: false,
    });
  }

  async searchUsers(query: string, organizationId?: string): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.getUsers({ search: query, organizationId });
  }

  async getUserStats(organizationId: string): Promise<ApiResponse<{
    total: number; active: number; pending: number; expired: number; inactive: number; frozen: number;
  }>> {
    return withCache(`user_stats_${organizationId}`, async () => {
      const results = await prisma.userMembership.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: { status: true },
      });
      const stats = { total: 0, active: 0, pending: 0, expired: 0, inactive: 0, frozen: 0 };
      for (const r of results) {
        const key = r.status as keyof typeof stats;
        if (key in stats) stats[key] = r._count.status;
        stats.total += r._count.status;
      }
      return createSuccessResponse(stats);
    }, 2 * 60 * 1000);
  }

  async healthCheck(): Promise<ApiResponse<{ status: "healthy" | "unhealthy"; details: Record<string, any> }>> {
    try {
      await prisma.user.count();
      return createSuccessResponse({
        status: "healthy" as const,
        details: { serviceName: "users", timestamp: new Date().toISOString() },
      });
    } catch (error) {
      return createSuccessResponse({
        status: "unhealthy" as const,
        details: {
          serviceName: "users",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

async function validateCreateData(data: any): Promise<void> {
  if (!data.firstName?.trim()) throw new ValidationError("First name is required", "firstName");
  if (!data.lastName?.trim()) throw new ValidationError("Last name is required", "lastName");
  if (!data.email || !data.email.includes("@")) throw new ValidationError("Valid email is required", "email");

  const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existingUser) {
    if (existingUser.deletedAt) {
      throw new ValidationError("Este correo pertenece a una cuenta desactivada. Contacte al administrador.", "email");
    }
    throw new ValidationError("Email already exists", "email");
  }
}

async function validateUpdateData(id: string, data: any, existingRecord: FitCenterUserProfile): Promise<void> {
  validateWithSchema(updateSchemas.user, data);
  if (data.email && data.email !== existingRecord.email) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingUser && existingUser.id !== id) {
      throw new ValidationError("Email already exists", "email");
    }
  }
}

export const userService = new UserService();
