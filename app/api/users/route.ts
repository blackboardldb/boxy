import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { createAuthUser } from "@/lib/supabase/admin";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { createUserSchema } from "@/lib/schemas";
import { toMidnightUTC } from "@/lib/utils/dates";
import { decryptPassword } from "@/lib/utils/encryption";
import type { MemberRole } from "@prisma/client";

// Whitelist: valores permitidos en body.role → enum MemberRole de Prisma.
// Solo ADMIN y COACH pueden crear usuarios (requireAdmin lo garantiza), pero
// solo un ADMIN puede asignar el rol ADMIN a otro usuario.
// Por ahora la regla de negocio es: cualquier ADMIN puede asignar cualquier rol.
// Si se necesita restricción OWNER-only para rol ADMIN, agregar guard adicional aquí.
const ROLE_MAP: Record<string, MemberRole> = {
  user:  "ALUMNO",
  alumno: "ALUMNO",
  coach: "COACH",
  admin: "ADMIN",
};

/** Convierte el rol del body al enum MemberRole. Default: ALUMNO. */
function toMemberRole(role?: string): MemberRole {
  return (role && ROLE_MAP[role.toLowerCase()]) || "ALUMNO";
}

/** Convierte el rol del body al literal que usa createAuthUser (lowercase). */
function toAuthRole(role?: string): "alumno" | "coach" | "admin" {
  const memberRole = toMemberRole(role);
  return memberRole.toLowerCase() as "alumno" | "coach" | "admin";
}

export async function GET(request: NextRequest) {
  try {
    // 0. Autenticación y Autorización
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const activeOrgId = auth.organizationId;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    // Use UserService to get users with filters
    const response = await userService.getUsers({
      page,
      limit,
      search: search || undefined,
      role: role || undefined,
      status: status || undefined,
      organizationId: activeOrgId,
    });

    // Return standardized response
    return NextResponse.json(response);
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getUsers",
      resource: "users",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 0. Autenticación y Autorización
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const activeOrgId = auth.organizationId;

    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Verificar si el usuario ya existe globalmente
    const emailLowerCase = body.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLowerCase },
      include: { memberships: true }
    });

    if (existingUser) {
      // Verificar si ya está en esta organización
      const inOrg = existingUser.memberships.find(m => m.organizationId === activeOrgId);
      if (inOrg) {
        // Caso C — email ya existe en organization_members para ese centro
        return NextResponse.json(
          { success: false, error: "Este alumno ya está registrado en este centro." },
          { status: 400 }
        );
      }

      // Caso B — email ya existe en users pero no en este centro
      //
      // Resolución de plan: si viene planId, buscar el plan para tener precio y duración
      let planDataB: { id: string; name: string; price: number; duration: number; config: unknown } | null = null;
      if (body.planId) {
        planDataB = await prisma.membershipPlan.findUnique({
          where: { id: body.planId },
          select: { id: true, name: true, price: true, duration: true, config: true },
        });
      }

      if (body.registrarIngreso && (!body.formaDePago || !planDataB)) {
        return NextResponse.json(
          { success: false, error: "Para registrar un ingreso se requiere un plan y una forma de pago." },
          { status: 400 }
        );
      }

      const membershipStartB = toMidnightUTC(body.startDate ?? null) ?? new Date();
      const membershipEndB = toMidnightUTC(body.endDate ?? null);
      const planConfigB = (planDataB?.config ?? {}) as Record<string, unknown>;

      await prisma.$transaction([
        prisma.organizationMember.create({
          data: {
            userId: existingUser.id,
            organizationId: activeOrgId,
            role: toMemberRole(body.role), // BUG-ROLE-01 fix: respetar el rol enviado por el admin
            formaDePago: body.formaDePago,
            status: "active"
          }
        }),
        prisma.userMembership.create({
          data: {
            userId: existingUser.id,
            organizationId: activeOrgId,
            // Si viene planId, crear la membresía activa con todos los datos del plan
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
        ...(body.registrarIngreso && planDataB ? [
          prisma.membershipRenewal.create({
            data: {
              userId: existingUser.id,
              organizationId: activeOrgId,
              requestedPlanId: planDataB.id,
              currentPlanId: null,
              paymentMethod: body.formaDePago!,
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
                paymentMethod: body.formaDePago!,
                startDate: body.startDate ?? null,
              }
            }
          })
        ] : [])
      ]);

      const updatedUser = await userService.getUserById(existingUser.id, activeOrgId);
      return NextResponse.json(updatedUser, { status: 201 });
    }

    // Caso A — email nuevo en el sistema
    // 1. Resolver la contraseña del tenant antes de tocar Auth
    const org = await prisma.organization.findUnique({
      where: { id: activeOrgId },
      select: { defaultStudentPassword: true },
    });
    if (!org?.defaultStudentPassword) {
      return NextResponse.json(
        { success: false, error: "El centro no tiene contraseña por defecto configurada. Configúrala desde el panel de administración." },
        { status: 500 }
      );
    }
    const plainStudentPassword = decryptPassword(org.defaultStudentPassword);
    if (plainStudentPassword.startsWith("Error")) {
      throw new Error(`[POST /api/users] No se pudo desencriptar defaultStudentPassword del centro ${activeOrgId}.`);
    }

    // 2. Crear en Supabase Auth y capturar el UUID (authId)
    let authId: string;
    try {
      console.log("[POST /api/users] Creando usuario en Supabase Auth:", emailLowerCase);
      authId = await createAuthUser(
        emailLowerCase,
        toAuthRole(body.role),
        plainStudentPassword,
        {
          firstName: body.firstName,
          lastName: body.lastName,
        },
        activeOrgId
      );
    } catch (authError: any) {
      console.error("[POST /api/users] Error en createAuthUser:", authError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_CREATE_FAILED",
            message: `No se pudo crear el usuario en el sistema de autenticación: ${authError.message}`,
          },
        },
        { status: 500 }
      );
    }

    // 2. Operación atómica: crear User, OrganizationMember, UserMembership
    //
    // Si viene planId, resolvemos el plan ANTES de la transacción para no mezclar
    // queries de lectura dentro de la transacción de escritura.
    let planData: { id: string; name: string; price: number; duration: number; config: unknown } | null = null;
    if (body.planId) {
      planData = await prisma.membershipPlan.findUnique({
        where: { id: body.planId },
        select: { id: true, name: true, price: true, duration: true, config: true },
      });
      if (!planData) {
        return NextResponse.json(
          { success: false, error: `Plan con id '${body.planId}' no encontrado.` },
          { status: 400 }
        );
      }
    }

    const membershipStart = toMidnightUTC(body.startDate ?? null) ?? new Date();
    const membershipEnd   = toMidnightUTC(body.endDate ?? null);
    const planConfig      = (planData?.config ?? {}) as Record<string, unknown>;

    if (body.registrarIngreso && (!body.formaDePago || !planData)) {
      return NextResponse.json(
        { success: false, error: "Para registrar un ingreso se requiere un plan y una forma de pago." },
        { status: 400 }
      );
    }

    try {
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: emailLowerCase,
            authId: authId,
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
            gender: body.gender,
            emergencyContact: body.emergencyContact ? JSON.stringify(body.emergencyContact) : undefined,
          }
        });

        await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: activeOrgId,
            role: toMemberRole(body.role), // BUG-ROLE-01 fix: respetar el rol enviado por el admin
            formaDePago: body.formaDePago,
            status: "active"
          }
        });

        // UserMembership: si viene planId lo asignamos con todos los datos del plan;
        // si no, queda en pending para asignación posterior.
        await tx.userMembership.create({
          data: {
            userId: user.id,
            organizationId: activeOrgId,
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

        if (body.registrarIngreso && planData) {
          await tx.membershipRenewal.create({
            data: {
              userId: user.id,
              organizationId: activeOrgId,
              requestedPlanId: planData.id,
              currentPlanId: null,
              paymentMethod: body.formaDePago!,
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
                paymentMethod: body.formaDePago!,
                startDate: body.startDate ?? null,
              }
            }
          });
        }

        return user;
      });

      const response = await userService.getUserById(newUser.id, activeOrgId);
      return NextResponse.json(response, { status: 201 });
    } catch (dbError: any) {
      console.error("[POST /api/users] Error BD, rollback en Auth:", dbError);
      await import("@/lib/supabase/admin").then(m => m.deleteAuthUser(authId));
      return NextResponse.json(
        { success: false, error: "Error al crear el perfil de usuario en base de datos." },
        { status: 500 }
      );
    }
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "createUser",
      resource: "users",
    });
  }
}

