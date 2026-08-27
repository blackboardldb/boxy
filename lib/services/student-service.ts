import { prisma } from "@/lib/prisma";
import { createAuthUser, deleteAuthUser } from "@/lib/supabase/admin";
import { toMidnightUTC } from "@/lib/utils/dates";
import { MemberRole } from "@prisma/client";

const ROLE_MAP: Record<string, MemberRole> = {
  user:  "ALUMNO",
  alumno: "ALUMNO",
  coach: "COACH",
  admin: "ADMIN",
};

export function toMemberRole(role?: string): MemberRole {
  return (role && ROLE_MAP[role.toLowerCase()]) || "ALUMNO";
}

export function toAuthRole(role?: string): "alumno" | "coach" | "admin" {
  const memberRole = toMemberRole(role);
  return memberRole.toLowerCase() as "alumno" | "coach" | "admin";
}

export type CreateStudentResult =
  | { status: "created"; userId: string; user: any }
  | { status: "attached_existing_user"; userId: string; user: any }
  | { status: "already_in_org"; userId: string; message: string }
  | { status: "error"; reason: string; error?: any; code?: string };

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | Date | null;
  gender?: string | null;
  emergencyContact?: any;
  role?: string;
  planId?: string | null;
  formaDePago?: string | null;
  registrarIngreso?: boolean;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

export const studentService = {
  /**
   * Maneja la lógica transaccional de creación de un alumno, incluyendo:
   * - Caso A: Usuario nuevo en el sistema (crea en Auth + Prisma)
   * - Caso B: Usuario existe en otro centro (asigna membresía sin tocar Auth)
   * - Caso C: Usuario ya existe en el centro (falla)
   */
  async createOrAttachStudent(
    input: CreateStudentInput,
    organizationId: string,
    plainStudentPassword?: string
  ): Promise<CreateStudentResult> {
    const emailLowerCase = input.email.toLowerCase();

    // Verificar si el usuario ya existe globalmente
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLowerCase },
      select: {
        id: true,
        memberships: { select: { organizationId: true } }
      }
    });

    if (existingUser) {
      // Verificar si ya está en esta organización
      const inOrg = existingUser.memberships.find(m => m.organizationId === organizationId);
      if (inOrg) {
        // Caso C
        return { 
          status: "already_in_org", 
          userId: existingUser.id, 
          message: "Este alumno ya está registrado en este centro." 
        };
      }

      // Caso B
      let planDataB: { id: string; name: string; price: number; duration: number; config: unknown } | null = null;
      if (input.planId) {
        planDataB = await prisma.membershipPlan.findUnique({
          where: { id: input.planId },
          select: { id: true, name: true, price: true, duration: true, config: true },
        });
      }

      if (input.registrarIngreso && (!input.formaDePago || !planDataB)) {
        return { status: "error", reason: "Para registrar un ingreso se requiere un plan y una forma de pago." };
      }

      const membershipStartB = toMidnightUTC(input.startDate ?? null) ?? new Date();
      const membershipEndB = toMidnightUTC(input.endDate ?? null);
      const planConfigB = (planDataB?.config ?? {}) as Record<string, unknown>;

      await prisma.$transaction([
        prisma.organizationMember.create({
          data: {
            userId: existingUser.id,
            organizationId,
            role: toMemberRole(input.role),
            formaDePago: input.formaDePago,
            status: "active"
          }
        }),
        prisma.userMembership.create({
          data: {
            userId: existingUser.id,
            organizationId,
            status: planDataB ? "active" : "pending",
            ...(planDataB && {
              planId: planDataB.id,
              membershipType: planDataB.name,
              monthlyPrice: planDataB.price,
              currentPeriodStart: membershipStartB,
              currentPeriodEnd: membershipEndB ?? undefined,
              classLimit: (planConfigB?.classLimit as number | undefined) ?? 0,
            }),
          }
        }),
        ...(input.registrarIngreso && planDataB ? [
          prisma.membershipRenewal.create({
            data: {
              userId: existingUser.id,
              organizationId,
              requestedPlanId: planDataB.id,
              currentPlanId: null,
              paymentMethod: input.formaDePago!,
              status: "approved",
              processedAt: new Date(),
              startDate: membershipStartB,
              amount: planDataB.price > 0 ? planDataB.price : null,
              notes: null,
              renewalDetails: {
                requestedPlanName: planDataB.name,
                requestedPlanPrice: planDataB.price,
                requestedPlanClassLimit: (planConfigB?.classLimit as number | undefined) ?? 0,
                requestedPlanDuration: planDataB.duration,
                paymentMethod: input.formaDePago!,
                startDate: input.startDate ?? null,
              }
            }
          })
        ] : [])
      ]);

      return { status: "attached_existing_user", userId: existingUser.id, user: existingUser };
    }

    // Caso A
    if (!plainStudentPassword) {
      return { status: "error", reason: "plainStudentPassword es requerido para crear un usuario nuevo." };
    }

    let authId: string;
    try {
      authId = await createAuthUser(
        emailLowerCase,
        toAuthRole(input.role),
        plainStudentPassword,
        { firstName: input.firstName, lastName: input.lastName },
        organizationId
      );
    } catch (authError: any) {
      return { 
        status: "error", 
        reason: `No se pudo crear el usuario en el sistema de autenticación: ${authError.message}`, 
        error: authError,
        code: "AUTH_CREATE_FAILED"
      };
    }

    let planData: { id: string; name: string; price: number; duration: number; config: unknown } | null = null;
    if (input.planId) {
      planData = await prisma.membershipPlan.findUnique({
        where: { id: input.planId },
        select: { id: true, name: true, price: true, duration: true, config: true },
      });
      if (!planData) {
        await deleteAuthUser(authId).catch((rollbackErr) => {
          console.error(
            `[studentService] CRÍTICO: rollback de Auth falló para authId=${authId} (plan no encontrado). Usuario huérfano posible en Supabase Auth.`,
            rollbackErr
          );
        });
        return { status: "error", reason: `Plan con id '${input.planId}' no encontrado.` };
      }
    }

    const membershipStart = toMidnightUTC(input.startDate ?? null) ?? new Date();
    const membershipEnd   = toMidnightUTC(input.endDate ?? null);
    const planConfig      = (planData?.config ?? {}) as Record<string, unknown>;

    if (input.registrarIngreso && (!input.formaDePago || !planData)) {
      await deleteAuthUser(authId).catch((rollbackErr) => {
        console.error(
          `[studentService] CRÍTICO: rollback de Auth falló para authId=${authId} (validación post-auth). Usuario huérfano posible en Supabase Auth.`,
          rollbackErr
        );
      });
      return { status: "error", reason: "Para registrar un ingreso se requiere un plan y una forma de pago." };
    }

    try {
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: emailLowerCase,
            authId: authId,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
            gender: input.gender,
            emergencyContact: input.emergencyContact ? JSON.stringify(input.emergencyContact) : undefined,
          }
        });

        await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId,
            role: toMemberRole(input.role),
            formaDePago: input.formaDePago,
            status: "active"
          }
        });

        await tx.userMembership.create({
          data: {
            userId: user.id,
            organizationId,
            status: planData ? "active" : "pending",
            ...(planData && {
              planId: planData.id,
              membershipType: planData.name,
              monthlyPrice: planData.price,
              currentPeriodStart: membershipStart,
              currentPeriodEnd: membershipEnd ?? undefined,
              classLimit: (planConfig?.classLimit as number | undefined) ?? 0,
            }),
          }
        });

        if (input.registrarIngreso && planData) {
          await tx.membershipRenewal.create({
            data: {
              userId: user.id,
              organizationId,
              requestedPlanId: planData.id,
              currentPlanId: null,
              paymentMethod: input.formaDePago!,
              status: "approved",
              processedAt: new Date(),
              startDate: membershipStart,
              amount: planData.price > 0 ? planData.price : null,
              notes: null,
              renewalDetails: {
                requestedPlanName: planData.name,
                requestedPlanPrice: planData.price,
                requestedPlanClassLimit: (planConfig?.classLimit as number | undefined) ?? 0,
                requestedPlanDuration: planData.duration,
                paymentMethod: input.formaDePago!,
                startDate: input.startDate ?? null,
              }
            }
          });
        }

        return user;
      });

      return { status: "created", userId: newUser.id, user: newUser };
    } catch (dbError: any) {
      console.error("[studentService] Error BD, rollback en Auth:", dbError);
      await deleteAuthUser(authId).catch((rollbackErr) => {
        console.error(
          `[studentService] CRÍTICO: rollback de Auth falló para authId=${authId} (error de BD). Usuario huérfano posible en Supabase Auth.`,
          rollbackErr
        );
      });
      return { status: "error", reason: "Error al crear el perfil de usuario en base de datos.", error: dbError };
    }
  }
};
