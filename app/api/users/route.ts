import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { createAuthUser } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { createUserSchema } from "@/lib/schemas";
import { toMidnightUTC } from "@/lib/utils/dates";

export async function GET(request: NextRequest) {
  try {
    // 0. Autenticación y Autorización
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    
    // Multi-tenant: usar organizationId del guard autenticado (MT-03)
    const organizationId = auth.organizationId;

    // Use UserService to get users with filters
    const response = await userService.getUsers({
      page,
      limit,
      search: search || undefined,
      role: role || undefined,
      status: status || undefined,
      organizationId: organizationId || undefined,
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
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Verificar si el usuario ya existe globalmente
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
      include: { memberships: true }
    });

    if (existingUser) {
      // Verificar si ya está en esta organización
      const inOrg = existingUser.memberships.find(m => m.organizationId === auth.organizationId);
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

      const membershipStartB = toMidnightUTC(body.startDate ?? null) ?? new Date();
      const membershipEndB = toMidnightUTC(body.endDate ?? null);
      const planConfigB = (planDataB?.config ?? {}) as Record<string, unknown>;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            emergencyContact: body.emergencyContact ? (typeof body.emergencyContact === 'string' ? body.emergencyContact : JSON.stringify(body.emergencyContact)) : undefined,
          }
        }),
        prisma.organizationMember.create({
          data: {
            userId: existingUser.id,
            organizationId: auth.organizationId,
            role: "ALUMNO",
            formaDePago: body.formaDePago,
            status: "active"
          }
        }),
        prisma.userMembership.create({
          data: {
            userId: existingUser.id,
            organizationId: auth.organizationId,
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
        })
      ]);

      const updatedUser = await userService.getUserById(existingUser.id);
      return NextResponse.json(updatedUser, { status: 201 });
    }

    // Caso A — email nuevo en el sistema
    // 1. Crear en Supabase Auth y capturar el UUID (authId)
    let authId: string;
    try {
      console.log("[POST /api/users] Creando usuario en Supabase Auth:", body.email);
      authId = await createAuthUser(
        body.email,
        "alumno", // Enum para createAuthUser en minúscula
        {
          firstName: body.firstName,
          lastName: body.lastName,
        },
        auth.organizationId
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

    try {
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: body.email,
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
            organizationId: auth.organizationId,
            role: "ALUMNO",
            formaDePago: body.formaDePago,
            status: "active"
          }
        });

        // UserMembership: si viene planId lo asignamos con todos los datos del plan;
        // si no, queda en pending para asignación posterior.
        await tx.userMembership.create({
          data: {
            userId: user.id,
            organizationId: auth.organizationId,
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

        return user;
      });

      const response = await userService.getUserById(newUser.id);
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

