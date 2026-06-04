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
    }));
  },

  /** Detalle completo de un centro. */
  async getById(id: string): Promise<OrgDetail | null> {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { email: true, name: true } } },
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
      members: org.members.map((m) => ({
        id: m.id,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
      payments: org.payments,
      events: org.events,
    };
  },

  /** Activa o suspende un centro. */
  async setStatus(
    id: string,
    status: OrgStatus,
    reason?: string
  ): Promise<void> {
    await prisma.organization.update({
      where: { id },
      data: {
        status,
        suspendedAt: status === "SUSPENDED" ? new Date() : null,
        suspendedReason: status === "SUSPENDED" ? (reason ?? null) : null,
      },
    });

    // Registrar evento del sistema
    await prisma.systemEvent.create({
      data: {
        organizationId: id,
        type: status === "SUSPENDED" ? "org_suspended" : "org_activated",
        message:
          status === "SUSPENDED"
            ? `Centro suspendido. Razón: ${reason ?? "sin especificar"}`
            : "Centro reactivado por el manager.",
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
    return prisma.organizationPayment.create({
      data: {
        organizationId,
        amount: data.amount,
        currency: data.currency ?? "CLP",
        method: data.method,
        notes: data.notes,
        paidAt: data.paidAt ?? new Date(),
      },
    });
  },
};
