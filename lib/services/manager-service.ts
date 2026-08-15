//lib/services/manager-service.ts

import { prisma } from "@/lib/prisma";
import type { OrgStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  createdAt: Date;
  memberCount: number;
  lastPayment: Date | null;
  billingCycle: string | null;
  billingPeriodEnd: Date | null;
  saasPlanName: "EARLY" | "BASE" | "PRO" | null;
}

export interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  suspendedReason: string | null;
  suspendedAt: Date | null;
  themePrimaryColor: string;
  themeVariant: number;
  createdAt: Date;
  email: string | null;
  phone: string | null;
  address: string | null;
  ownerName: string | null;
  ownerLastName: string | null;
  ownerRut: string | null;
  billingPlan: string | null;
  billingCycle: string | null;
  billingPeriodEnd: Date | null;
  saasPlanName: "EARLY" | "BASE" | "PRO" | null;
  overrideMaxActiveStudents: number | null;
  customIconUrl: string | null;
  customSplashUrl: string | null;
  allowCustomBranding: boolean;
  // BUG-07: members se expone solo como conteo — nunca como lista de PII.
  // Un manager debe ver métricas de billing, no datos personales de alumnos/coaches.
  memberCount: number;
  payments: {
    id: string;
    amount: number;
    currency: string;
    paidAt: Date;
    method: string | null;
    notes: string | null;
  }[];
  events: {
    id: string;
    type: string;
    message: string;
    createdAt: Date;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateBillingPeriodEnd(cycle: string, fromDate: Date = new Date()): Date {
  const d = new Date(fromDate);
  const currentDay = d.getDate();
  const targetDay = cycle === 'B' ? 25 : 10;

  if (currentDay <= targetDay) {
    // Vence este mes
    d.setDate(targetDay);
  } else {
    // Vence el próximo mes
    d.setMonth(d.getMonth() + 1);
    d.setDate(targetDay);
  }
  // Al final del día
  d.setHours(23, 59, 59, 999);
  return d;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const managerService = {
  /** Lista todos los centros con conteo de miembros y último pago. Soporta paginación opcional. */
  async listAll(page = 1, limit = 50): Promise<{ data: OrgSummary[], total: number }> {
    const skip = (page - 1) * limit;
    const [orgs, total] = await Promise.all([
      prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { members: true } },
          payments: {
            orderBy: { paidAt: "desc" },
            take: 1,
            select: { paidAt: true },
          },
        },
      }),
      prisma.organization.count()
    ]);

    return {
      total,
      data: orgs.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        createdAt: org.createdAt,
        memberCount: org._count.members,
        lastPayment: org.payments[0]?.paidAt ?? null,
        billingCycle: org.billingCycle,
        billingPeriodEnd: org.billingPeriodEnd,
        saasPlanName: org.saasPlanName as any,
      }))
    };
  },

  /** Crea un centro y su primer admin. */
  async createOrganization(
    data: {
      name: string;
      slug: string;
      billingCycle: string;
      email?: string;
      phone?: string;
      address?: string;
      ownerName?: string;
      ownerLastName?: string;
      ownerRut?: string;
    },
    adminData: { email: string; firstName: string; lastName: string }
  ) {
    const { createAuthUser } = await import("@/lib/supabase/admin");

    const billingPeriodEnd = calculateBillingPeriodEnd(data.billingCycle);

    const { encryptPassword } = await import("@/lib/utils/encryption");
    const crypto = await import("crypto");

    const generateSimplePassword = (slug: string) => {
      // Cryptographically secure random 4 digits (1000 to 9999)
      const nums = crypto.randomInt(1000, 10000).toString();
      // Secure random choice for symbol position
      return crypto.randomInt(0, 2) === 1 ? `${slug}@${nums}` : `${slug}${nums}@`;
    };

    const defaultAdminPassword = encryptPassword(generateSimplePassword(data.slug));
    const defaultStudentPassword = encryptPassword(generateSimplePassword(data.slug));
    const defaultCoachPassword = encryptPassword(generateSimplePassword(data.slug));

    // 1. Crear organización primero (para obtener ID)
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        status: "TRIAL",
        themePrimaryColor: "#6366f1",
        billingCycle: data.billingCycle,
        billingPeriodEnd,
        email: data.email,
        phone: data.phone,
        address: data.address,
        ownerName: data.ownerName,
        ownerLastName: data.ownerLastName,
        ownerRut: data.ownerRut,
        saasPlanName: "BASE", // default asignado a todos los nuevos centros
        defaultAdminPassword: defaultAdminPassword,
        defaultStudentPassword: defaultStudentPassword,
        defaultCoachPassword: defaultCoachPassword,
      },
    });

    // 2. Crear admin en Supabase Auth
    let authId: string;
    try {
      authId = await createAuthUser(
        adminData.email,
        "admin", // minúscula para createAuthUser
        { firstName: adminData.firstName, lastName: adminData.lastName },
        org.id
      );
    } catch (error) {
      // Rollback org
      await prisma.organization.delete({ where: { id: org.id } });
      throw error;
    }

    // 3. Crear perfil de usuario y membresía de admin
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            authId,
            email: adminData.email,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
          },
        });

        await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            role: "ADMIN",
            status: "active",
          },
        });
      });
    } catch (error) {
      // Rollback Auth y Org
      await import("@/lib/supabase/admin").then((m) => m.deleteAuthUser(authId));
      await prisma.organization.delete({ where: { id: org.id } });
      throw error;
    }

    return org;
  },

  /** Detalle completo de un centro (sin PII de miembros). */
  async getById(id: string): Promise<OrgDetail | null> {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        // BUG-07: se usa _count en lugar de include de members con PII.
        // El manager sólo necesita saber cuántos miembros hay, no quiénes son.
        _count: { select: { members: true } },
        payments: { orderBy: { paidAt: "desc" }, take: 50 },
        events: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!org) return null;

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      suspendedReason: org.suspendedReason,
      suspendedAt: org.suspendedAt,
      themePrimaryColor: org.themePrimaryColor,
      themeVariant: org.themeVariant,
      createdAt: org.createdAt,
      email: org.email,
      phone: org.phone,
      address: org.address,
      ownerName: org.ownerName,
      ownerLastName: org.ownerLastName,
      ownerRut: org.ownerRut,
      billingPlan: org.billingPlan,
      billingCycle: org.billingCycle,
      billingPeriodEnd: org.billingPeriodEnd,
      saasPlanName: org.saasPlanName as any,
      overrideMaxActiveStudents: org.overrideMaxActiveStudents,
      customIconUrl: org.customIconUrl,
      customSplashUrl: org.customSplashUrl,
      allowCustomBranding: org.allowCustomBranding,
      memberCount: org._count.members,
      payments: org.payments,
      events: org.events,
    };
  },

  /** Actualiza datos de contacto, dueño y billing del centro. */
  async updateInfo(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      ownerName?: string;
      ownerLastName?: string;
      ownerRut?: string;
      billingPlan?: string;
      billingCycle?: string;
      saasPlanName?: "EARLY" | "BASE" | "PRO" | null;
      overrideMaxActiveStudents?: number | null;
      customIconUrl?: string | null;
      customSplashUrl?: string | null;
      allowCustomBranding?: boolean;
    }
  ): Promise<void> {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw new Error("Centro no encontrado");
    await prisma.organization.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.ownerName !== undefined && { ownerName: data.ownerName }),
        ...(data.ownerLastName !== undefined && { ownerLastName: data.ownerLastName }),
        ...(data.ownerRut !== undefined && { ownerRut: data.ownerRut }),
        ...(data.billingPlan !== undefined && { billingPlan: data.billingPlan }),
        ...(data.billingCycle !== undefined && { billingCycle: data.billingCycle }),
        ...(data.saasPlanName !== undefined && { saasPlanName: data.saasPlanName }),
        ...(data.overrideMaxActiveStudents !== undefined && { overrideMaxActiveStudents: data.overrideMaxActiveStudents }),
        ...(data.customIconUrl !== undefined && { customIconUrl: data.customIconUrl }),
        ...(data.customSplashUrl !== undefined && { customSplashUrl: data.customSplashUrl }),
        ...(data.allowCustomBranding !== undefined && { allowCustomBranding: data.allowCustomBranding }),
      },
    });
  },

  /** Obtiene contraseñas desencriptadas y deja registro de auditoría. */
  async getDefaultPasswords(orgId: string, managerUserId: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error("Centro no encontrado");

    await prisma.systemEvent.create({
      data: {
        organizationId: orgId,
        type: "password_view",
        message: `El manager ${managerUserId} visualizó las contraseñas por defecto.`,
        metadata: { managerUserId, timestamp: new Date().toISOString() }
      }
    });

    const { decryptPassword } = await import("@/lib/utils/encryption");

    return {
      adminPassword: org.defaultAdminPassword ? decryptPassword(org.defaultAdminPassword) : null,
      studentPassword: org.defaultStudentPassword ? decryptPassword(org.defaultStudentPassword) : null,
      coachPassword: org.defaultCoachPassword ? decryptPassword(org.defaultCoachPassword) : null,
    };
  },

  /** Genera nuevas contraseñas simples para un centro existente (ej. centros antiguos sin claves) */
  async resetDefaultPasswords(orgId: string, managerUserId: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error("Centro no encontrado");

    const { encryptPassword } = await import("@/lib/utils/encryption");
    const crypto = await import("crypto");

    const generateSimplePassword = (slug: string) => {
      // Cryptographically secure random 4 digits
      const nums = crypto.randomInt(1000, 10000).toString();
      return crypto.randomInt(0, 2) === 1 ? `${slug}@${nums}` : `${slug}${nums}@`;
    };

    const adminPasswordPlain = generateSimplePassword(org.slug);
    const studentPasswordPlain = generateSimplePassword(org.slug);
    const coachPasswordPlain = generateSimplePassword(org.slug);

    await prisma.organization.update({
      where: { id: orgId },
      data: {
        defaultAdminPassword: encryptPassword(adminPasswordPlain),
        defaultStudentPassword: encryptPassword(studentPasswordPlain),
        defaultCoachPassword: encryptPassword(coachPasswordPlain),
      }
    });

    await prisma.systemEvent.create({
      data: {
        organizationId: orgId,
        type: "password_reset",
        message: `El manager ${managerUserId} generó nuevas contraseñas por defecto.`,
        metadata: { managerUserId, timestamp: new Date().toISOString() }
      }
    });

    // Retorna en texto plano a la interfaz que lo acaba de generar
    return {
      adminPassword: adminPasswordPlain,
      studentPassword: studentPasswordPlain,
      coachPassword: coachPasswordPlain
    };
  },

  /** Activa o suspende un centro. */
  async setStatus(
    id: string,
    status: OrgStatus,
    reason?: string
  ): Promise<void> {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw new Error("Centro no encontrado");

    let billingPeriodEnd = org.billingPeriodEnd;

    // Si se activa manualmente (TRIAL->ACTIVE o SUSPENDED->ACTIVE), recalculamos el próximo vencimiento
    if (status === 'ACTIVE' && org.status !== 'ACTIVE') {
      billingPeriodEnd = calculateBillingPeriodEnd(org.billingCycle ?? 'A');
    }

    await prisma.organization.update({
      where: { id },
      data: {
        status,
        suspendedAt: (status === "SUSPENDED" || status === "CANCELED") ? new Date() : null,
        suspendedReason: status === "SUSPENDED" ? (reason ?? null) : (status === "CANCELED" ? "canceled" : null),
        billingPeriodEnd,
      },
    });

    // Registrar evento del sistema
    await prisma.systemEvent.create({
      data: {
        organizationId: id,
        type: status === "SUSPENDED" ? "org_suspended" : (status === "CANCELED" ? "org_canceled" : "org_activated"),
        message:
          status === "SUSPENDED"
            ? `Centro suspendido. Razón: ${reason ?? "sin especificar"}`
            : status === "CANCELED"
              ? "Centro cancelado definitivamente."
              : `Centro reactivado/activado por el manager. Razón: ${reason ?? "sin especificar"}`,
      },
    });
  },

  /** Registra un pago manual del centro hacia Boxy. */
  async registerPayment(
    organizationId: string,
    data: {
      amount: number; // en centavos
      currency?: string;
      method?: string;
      notes?: string;
      paidAt?: Date;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.organizationPayment.create({
        data: {
          organizationId,
          amount: data.amount,
          currency: data.currency ?? "CLP",
          method: data.method,
          notes: data.notes,
          paidAt: data.paidAt ?? new Date(),
        },
      });

      const org = await tx.organization.findUnique({ where: { id: organizationId } });
      if (org) {
        const cycle = org.billingCycle ?? 'A';
        const newBillingEnd = calculateBillingPeriodEnd(cycle, data.paidAt ?? new Date());

        const isSuspended = org.status === 'SUSPENDED';

        await tx.organization.update({
          where: { id: organizationId },
          data: {
            billingPeriodEnd: newBillingEnd,
            ...(isSuspended ? { status: 'ACTIVE', suspendedAt: null, suspendedReason: null } : {})
          }
        });

        if (isSuspended) {
          await tx.systemEvent.create({
            data: {
              organizationId,
              type: "org_activated",
              message: "Centro reactivado automáticamente por registro de pago.",
            }
          });
        }
      }

      return payment;
    });
  },
};
