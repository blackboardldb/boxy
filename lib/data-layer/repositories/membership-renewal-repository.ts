import { MembershipRenewalRepository as IMembershipRenewalRepository, FindManyParams, FindUniqueParams, CreateData, UpdateData, CountParams, PaginatedResult } from "../types";
import { PendingRenewalRequest } from "../../types";
import { prisma } from "../../prisma";
import { Prisma } from "@prisma/client";

type RenewalRow = Prisma.MembershipRenewalGetPayload<{ include: { user: true } }>
               | Prisma.MembershipRenewalGetPayload<Record<string, never>>;
type RenewalDetails = { planName?: string; planPrice?: number; classLimit?: number; duration?: number; previousPlanId?: string };

export class PrismaMembershipRenewalRepository implements IMembershipRenewalRepository {
  private get prisma() {
    return prisma;
  }

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<PendingRenewalRequest>> {
    const page = params?.page || 1;
    const limit = params?.limit || params?.take || 10;
    const skip = params?.skip !== undefined ? params.skip : (page - 1) * limit;

    const [renewals, total] = await Promise.all([
      this.prisma.membershipRenewal.findMany({
        where: params?.where,
        orderBy: params?.orderBy,
        take: limit,
        skip,
        include: {
          user: true
        }
      }),
      this.prisma.membershipRenewal.count({ where: params?.where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: renewals.map((r) => this.mapToEntity(r)),
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

  async findUnique(params: FindUniqueParams): Promise<PendingRenewalRequest | null> {
    const renewal = await this.prisma.membershipRenewal.findUnique({
      where: params.where as Prisma.MembershipRenewalWhereUniqueInput,
      include: {
        user: true
      }
    });
    return renewal ? this.mapToEntity(renewal) : null;
  }

  async create(data: CreateData<PendingRenewalRequest>): Promise<PendingRenewalRequest> {
    const created = await this.prisma.membershipRenewal.create({
      data: {
        id: data.id,
        userId: data.requestedBy,
        // MT-05: organizationId ahora es NOT NULL — requiere valor
        organizationId: (data as any).organizationId || "",
        requestedPlanId: data.requestedPlanId,
        status: data.status,
        paymentMethod: data.requestedPaymentMethod,
        requestedAt: data.requestDate ? new Date(data.requestDate) : new Date(),
        notes: data.notes,
        renewalDetails: {
          planName: data.requestedPlanName,
          planPrice: data.requestedPlanPrice,
          classLimit: data.requestedPlanClassLimit,
          duration: data.requestedPlanDuration,
          previousPlanId: data.previousPlanId
        } as Prisma.InputJsonValue,
      },
    });
    return this.mapToEntity(created);
  }

  async update(id: string, data: UpdateData<PendingRenewalRequest>): Promise<PendingRenewalRequest> {
    const updated = await this.prisma.membershipRenewal.update({
      where: { id },
      data: {
        status: data.status,
        processedAt: data.processedDate ? new Date(data.processedDate) : undefined,
        notes: data.notes,
        paymentMethod: data.requestedPaymentMethod,
        // (Other fields as needed)
      },
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<PendingRenewalRequest> {
    const deleted = await this.prisma.membershipRenewal.delete({
      where: { id },
    });
    return this.mapToEntity(deleted);
  }

  async count(params: CountParams = {}): Promise<number> {
    return this.prisma.membershipRenewal.count({
      where: params?.where,
    });
  }

  async findByUser(userId: string): Promise<PendingRenewalRequest[]> {
    const renewals = await this.prisma.membershipRenewal.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' }
    });
    return renewals.map(r => this.mapToEntity(r));
  }

  async findByStatus(status: string): Promise<PendingRenewalRequest[]> {
    const renewals = await this.prisma.membershipRenewal.findMany({
      where: { status },
      orderBy: { requestedAt: 'desc' }
    });
    return renewals.map(r => this.mapToEntity(r));
  }

  private mapToEntity(r: RenewalRow): PendingRenewalRequest {
    const details = ((r.renewalDetails as unknown) as RenewalDetails) || {};
    return {
      id: r.id,
      requestedPlanId: r.requestedPlanId || "",
      requestedPlanName: details.planName,
      requestedPlanPrice: details.planPrice,
      requestedPlanClassLimit: details.classLimit,
      requestedPlanDuration: details.duration,
      requestedPaymentMethod: (r.paymentMethod as PendingRenewalRequest["requestedPaymentMethod"]) || "transferencia",
      requestDate: r.requestedAt?.toISOString(),
      status: (r.status as PendingRenewalRequest["status"]) || "pending",
      requestedBy: r.userId,
      processedBy: undefined,
      processedDate: r.processedAt?.toISOString(),
      notes: r.notes || "",
      previousPlanId: details.previousPlanId,
    };
  }
}
