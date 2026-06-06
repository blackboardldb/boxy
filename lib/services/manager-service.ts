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
  members: {
    id: string;
    role: string;
    status: string;
    joinedAt: Date;
    user: { email: string; name: string };
  }[];
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
  /** Lista todos los centros con conteo de miembros y último pago. */
  async listAll(): Promise<OrgSummary[]> {
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true } },
        payments: {
          orderBy: { paidAt: "desc" },
          take: 1,
          select: { paidAt: true },
        },
      },
    });

    return orgs.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      createdAt: org.createdAt,
      memberCount: org._count.members,
      lastPayment: org.payments[0]?.paidAt ?? null,
      billingCycle: org.billingCycle,
      billingPeriodEnd: org.billingPeriodEnd,
    }));
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

  /** Detalle completo de un centro. */
  async getById(id: string): Promise<OrgDetail | null> {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { email: true, firstName: true, lastName: true } } },
          orderBy: { joinedAt: "desc" },
        },
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
      members: org.members.map((m) => ({
        id: m.id,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: {
          email: m.user.email,
          name: `${m.user.firstName} ${m.user.lastName}`.trim(),
        },
      })),
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
    }
  ): Promise<void> {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw new Error("Centro no encontrado");
    await prisma.organization.update({
      where: { id },
      data: {
        ...(data.name         && { name: data.name }),
        ...(data.email        !== undefined && { email: data.email }),
        ...(data.phone        !== undefined && { phone: data.phone }),
        ...(data.address      !== undefined && { address: data.address }),
        ...(data.ownerName    !== undefined && { ownerName: data.ownerName }),
        ...(data.ownerLastName !== undefined && { ownerLastName: data.ownerLastName }),
        ...(data.ownerRut     !== undefined && { ownerRut: data.ownerRut }),
        ...(data.billingPlan  !== undefined && { billingPlan: data.billingPlan }),
        ...(data.billingCycle !== undefined && { billingCycle: data.billingCycle }),
      },
    });
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
