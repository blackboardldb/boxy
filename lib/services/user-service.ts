// Enhanced UserService using new data layer architecture
// Maintains existing API while using new provider-based architecture

import { BaseService } from "./base-service";
import { FitCenterUserProfile } from "../types";
import { UserRepository } from "../data-layer/types";
import { ApiResponse, PaginatedApiResponse } from "../api/types";
import { generatedSchemas, updateSchemas, validateWithSchema } from "../types/generator";
import { ValidationError, NotFoundError } from "../errors/types";
import { prisma } from "../prisma";
import { deleteAuthUser } from "../supabase/admin";
import * as Sentry from "@sentry/nextjs";

export class UserService extends BaseService<FitCenterUserProfile> {
  protected repositoryName = "users" as const;

  // Get the typed user repository
  private get userRepository(): UserRepository {
    return this.repository as UserRepository;
  }

  // Enhanced methods using new architecture

  // Get users with pagination and filtering
  // HAL-01 Fase 4 Sprint 2.4: Todas las condiciones JSONB migradas a userMembership relacional.
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    organizationId?: string;
  }): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    const findParams: any = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    // Build where clause
    const conditions: any[] = [];

    if (params?.role) {
      conditions.push({ role: params.role });
    }

    if (params?.organizationId) {
      conditions.push({ organizationId: params.organizationId });
    }

    if (params?.status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (params.status === "active") {
        // Activo: tiene UserMembership, currentPeriodEnd >= hoy, status no bloqueado
        conditions.push({
          userMembership: {
            currentPeriodEnd: { gte: today },
            status: { notIn: ["inactive", "suspended", "expired"] },
          },
        });
      } else if (params.status === "scheduled") {
        // Scheduled: UserMembership existe con currentPeriodStart > hoy
        conditions.push({
          userMembership: {
            currentPeriodStart: { gt: today },
          },
        });
      } else if (params.status === "pending") {
        // Pending: UserMembership con status=pending
        conditions.push({
          userMembership: { status: "pending" },
        });
      } else if (params.status === "inactive") {
        // Inactive: sin UserMembership, o status=inactive/suspended, o período vencido
        conditions.push({
          OR: [
            { userMembership: null },
            { userMembership: { status: { in: ["inactive", "suspended", "expired"] } } },
            {
              userMembership: {
                currentPeriodEnd: { lt: today },
                status: { notIn: ["pending", "scheduled"] },
              },
            },
          ],
        });
      } else {
        // Fallback: cualquier otro status field directo
        conditions.push({
          userMembership: { status: params.status },
        });
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

    const where: any = conditions.length > 0 ? { AND: conditions } : {};

    if (Object.keys(where).length > 0) {
      findParams.where = where;
    }

    return this.findMany(findParams);
  }

  // Get user by ID (enhanced with API response)
  async getUserById(
    id: string
  ): Promise<ApiResponse<FitCenterUserProfile | null>> {
    return this.findById(id);
  }

  // Get user by email
  async getUserByEmail(
    email: string
  ): Promise<ApiResponse<FitCenterUserProfile | null>> {
    return this.withCache(`user_email_${email}`, async () => {
      const user = await this.userRepository.findByEmail(email);
      return this.createSuccessResponse(user);
    });
  }

  // Create user with validation
  async createUser(userData: any): Promise<ApiResponse<FitCenterUserProfile>> {
    return this.create(userData);
  }

  // Update user
  async updateUser(
    id: string,
    userData: any
  ): Promise<ApiResponse<FitCenterUserProfile>> {
    return this.update(id, userData);
  }

  // Delete user — Soft Delete
  // El alumno desaparece de toda la operativa pero su historial financiero
  // (MembershipRenewal) se preserva intacto. Acción permanente desde la UI.
  async deleteUser(id: string): Promise<ApiResponse<FitCenterUserProfile>> {
    return this.withErrorHandling(async () => {

      // 1. Obtener el usuario (sin filtro de deletedAt — findUnique lo ve)
      const existingUser = await this.userRepository.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundError("User", id);
      }

      // 2. Soft delete en BD — estampar fecha de eliminación
      // Usamos el nuevo método dedicado softDelete
      const updatedUser = await this.userRepository.softDelete(id);

      // 3. Desactivar membresía y detener auto-renovación
      if (existingUser.membership) {
        await this.userRepository.updateMembershipStatus(id, "inactive");
        // updateMembershipStatus solo cambia status — desactivar autoRenews por separado
        await prisma.userMembership.update({
          where: { userId: id },
          data: { autoRenews: false },
        });
      }

      // 4. Revocar acceso en Supabase Auth
      // Usamos authId (UUID de Supabase) para eliminar directamente — sin listUsers().
      if (existingUser.authId) {
        try {
          await deleteAuthUser(existingUser.authId);
        } catch (error) {
          Sentry.captureException(error, {
            extra: { userId: id, authId: existingUser.authId, action: "soft_delete_auth_revoke" },
          });
          console.error(
            `[UserService] ALERTA: Soft delete OK en BD, pero falló revocación en Supabase Auth para authId=${existingUser.authId}. Requiere limpieza manual.`,
            error
          );
        }
      } else {
        // Usuario sin authId — ya eliminado de Auth o creado antes del backfill
        console.warn(`[UserService] Usuario ${id} sin authId — omitiendo revocación en Auth.`);
      }

      this.clearCache();
      this.clearCache(`user_email_${existingUser.email}`);

      console.log(`[UserService] Alumno eliminado (soft delete): userId=${id} (${existingUser.email})`);

      return this.createSuccessResponse(updatedUser);
    });
  }

  // User-specific methods

  // Get users with membership
  // ANTES: membership: { NOT: null } → Full Table Scan JSONB
  // AHORA: userMembership: { isNot: null } → índice btree
  async getUsersWithMembership(): Promise<
    PaginatedApiResponse<FitCenterUserProfile>
  > {
    return this.findMany({
      where: {
        userMembership: { isNot: null },
      },
    });
  }

  // Get active users
  // ANTES: membership: { status: "active" } → JSONB path scan
  // AHORA: userMembership: { status: "active" } → índice btree
  async getActiveUsers(): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.findMany({
      where: {
        userMembership: { status: "active" },
      },
    });
  }

  // Get users by membership status
  // ANTES: membership: { status } → JSONB path scan
  // AHORA: userMembership: { status } → índice btree
  async getUsersByMembershipStatus(
    status: string
  ): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.findMany({
      where: {
        userMembership: { status },
      },
    });
  }

  // Search users
  async searchUsers(
    query: string
  ): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.search(query, ["firstName", "lastName", "email"]);
  }

  // Get pending users (for admin approval)
  // ANTES: membership: { status: "pending" } → JSONB path scan
  // AHORA: userMembership: { status: "pending" } → índice btree
  async getPendingUsers(): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.findMany({
      where: {
        userMembership: { status: "pending" },
      },
    });
  }

  // Get expired users
  // ANTES: membership: { status: "expired" } → JSONB path scan
  // AHORA: userMembership: { status: "expired" } → índice btree
  async getExpiredUsers(): Promise<PaginatedApiResponse<FitCenterUserProfile>> {
    return this.findMany({
      where: {
        userMembership: { status: "expired" },
      },
    });
  }

  // Get users with expiring memberships
  async getUsersWithExpiringMemberships(
    days: number = 7
  ): Promise<ApiResponse<FitCenterUserProfile[]>> {
    return this.withErrorHandling(async () => {
      const users = await this.userRepository.findMany();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);
      const cutoffString = cutoffDate.toISOString().split("T")[0];

      const expiringUsers = users.items.filter((user) => {
        if (!user.membership || user.membership.status !== "active") {
          return false;
        }
        return user.membership.currentPeriodEnd <= cutoffString;
      });

      return this.createSuccessResponse(expiringUsers);
    });
  }

  // Approve pending user
  // HAL-01 Phase 3B: status es ciudadano de primera clase — sin spread del JSONB
  async approveUser(
    userId: string
  ): Promise<ApiResponse<FitCenterUserProfile>> {
    return this.withErrorHandling(async () => {
      const user = await this.userRepository.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundError("User", userId);
      }

      if (!user.membership || user.membership.status !== "pending") {
        throw new ValidationError("User is not pending approval");
      }

      // Escribe directamente en UserMembership + dual-write JSONB (Phase 3)
      const updatedUser = await this.userRepository.updateMembershipStatus(userId, "active");

      await this.afterUserApproval(updatedUser);

      return this.createSuccessResponse(updatedUser);
    });
  }

  // Reject pending user
  // HAL-01 Phase 3B: status es ciudadano de primera clase — sin spread del JSONB.
  // rejectionInfo eliminado: no tenía columna en Prisma y nunca se persistía realmente.
  async rejectUser(
    userId: string,
    reason: string,
    rejectedBy: string
  ): Promise<ApiResponse<FitCenterUserProfile>> {
    return this.withErrorHandling(async () => {
      const user = await this.userRepository.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundError("User", userId);
      }

      if (!user.membership || user.membership.status !== "pending") {
        throw new ValidationError("User is not pending approval");
      }

      // Escribe directamente en UserMembership + dual-write JSONB (Phase 3)
      const updatedUser = await this.userRepository.updateMembershipStatus(userId, "inactive");

      await this.afterUserRejection(updatedUser, reason);

      return this.createSuccessResponse(updatedUser);
    });
  }

  // Update membership status
  // HAL-01 Phase 3B: delega directamente al repositorio — sin spread del JSONB
  async updateMembershipStatus(
    userId: string,
    status: string
  ): Promise<ApiResponse<FitCenterUserProfile>> {
    return this.withErrorHandling(async () => {
      const user = await this.userRepository.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundError("User", userId);
      }

      if (!user.membership) {
        throw new ValidationError("User has no membership to update");
      }

      // Escribe directamente en UserMembership + dual-write JSONB (Phase 3)
      const updatedUser = await this.userRepository.updateMembershipStatus(userId, status);

      return this.createSuccessResponse(updatedUser);
    });
  }

  // Get user statistics
  async getUserStats(organizationId?: string): Promise<
    ApiResponse<{
      total: number;
      active: number;
      pending: number;
      expired: number;
      inactive: number;
      frozen: number;
    }>
  > {
    const cacheKey = organizationId ? `user_stats_${organizationId}` : "user_stats";
    return this.withCache(
      cacheKey,
      async () => {
        const stats = await (this.userRepository as any).getUserStats(organizationId);
        return this.createSuccessResponse(stats);
      },
      2 * 60 * 1000 // Cache for 2 minutes
    );
  }

  // Validation hooks

  protected async validateCreateData(data: any): Promise<void> {
    // Validación básica y más permisiva para creación de usuarios
    if (!data.firstName || data.firstName.trim().length === 0) {
      throw new ValidationError("First name is required", "firstName");
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      throw new ValidationError("Last name is required", "lastName");
    }

    if (!data.email || !data.email.includes("@")) {
      throw new ValidationError("Valid email is required", "email");
    }

    // Additional business validation
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        // Distinguir cuenta eliminada de una activa — evitar reuso silencioso
        // y crash de Unique Constraint en la BD.
        if ((existingUser as any).deletedAt) {
          throw new ValidationError(
            "Este correo pertenece a una cuenta desactivada. Contacte al administrador.",
            "email"
          );
        }
        throw new ValidationError("Email already exists", "email");
      }
    }
  }

  protected async validateUpdateData(
    id: string,
    data: any,
    existingRecord: FitCenterUserProfile
  ): Promise<void> {
    // Validate using generated schema (deep partial for updates)
    const updateSchema = updateSchemas.user;
    validateWithSchema(updateSchema, data);

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== existingRecord.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new ValidationError("Email already exists", "email");
      }
    }
  }

  protected async validateDelete(
    id: string,
    existingRecord: FitCenterUserProfile
  ): Promise<void> {
    // Check if user has active classes or other dependencies
    // This would require checking with other services/repositories

    if (existingRecord.membership?.status === "active") {
      throw new ValidationError(
        "Cannot delete user with active membership. Please deactivate first."
      );
    }
  }

  // Lifecycle hooks

  protected async afterCreate(record: FitCenterUserProfile): Promise<void> {
    // Clear cache
    this.clearCache();

    // Log user creation
    console.log(`[UserService] User created: ${record.id} (${record.email})`);

    // Send welcome email, create audit log, etc.
    await this.afterUserCreation(record);
  }

  protected async afterUpdate(
    updatedRecord: FitCenterUserProfile,
    previousRecord: FitCenterUserProfile
  ): Promise<void> {
    // Clear cache
    this.clearCache();
    this.clearCache(`user_email_${updatedRecord.email}`);

    // NOTA: El registro de ingresos/renovación se crea explícitamente desde el frontend
    // a través de POST /api/users/[id]/renewal con autoApprove: true.
    // El bloque automático que existía aquí generaba registros sin organizationId,
    // amount ni processedAt — dejándolos invisibles en el dashboard de finanzas.

    await this.afterUserUpdate(updatedRecord, previousRecord);
  }

  protected async afterDelete(
    deletedRecord: FitCenterUserProfile
  ): Promise<void> {
    // Clear cache
    this.clearCache();
    this.clearCache(`user_email_${deletedRecord.email}`);

    console.log(
      `[UserService] User deleted: ${deletedRecord.id} (${deletedRecord.email})`
    );

    await this.afterUserDeletion(deletedRecord);
  }

  // Business logic hooks (can be overridden or extended)

  protected async afterUserCreation(user: FitCenterUserProfile): Promise<void> {
    // Override in subclasses or extend for specific business logic
    // e.g., send welcome email, create audit log, etc.
  }

  protected async afterUserUpdate(
    updatedUser: FitCenterUserProfile,
    previousUser: FitCenterUserProfile
  ): Promise<void> {
    // Override in subclasses or extend for specific business logic
    // e.g., send notification emails, update related records, etc.
  }

  protected async afterUserDeletion(
    deletedUser: FitCenterUserProfile
  ): Promise<void> {
    // Override in subclasses or extend for specific business logic
    // e.g., cleanup related data, send notifications, etc.
  }

  protected async afterUserApproval(user: FitCenterUserProfile): Promise<void> {
    // Send approval email, create audit log, etc.
    console.log(`[UserService] User approved: ${user.id} (${user.email})`);
  }

  protected async afterUserRejection(
    user: FitCenterUserProfile,
    reason: string
  ): Promise<void> {
    // Send rejection email, create audit log, etc.
    console.log(
      `[UserService] User rejected: ${user.id} (${user.email}) - Reason: ${reason}`
    );
  }

  // Helper methods

  private async withErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error("[UserService] Operation failed:", error);
      throw error;
    }
  }

  private createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      data,
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        processingTime: this.getProcessingTime(),
      },
    };
  }
}

// Export singleton instance
export const userService = new UserService();
