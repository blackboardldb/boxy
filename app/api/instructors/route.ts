import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { instructorService } from "@/lib/services/instructor-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { createAuthUser } from "@/lib/supabase/admin";
import { requireAdminFast, requireAuthFast } from "@/lib/supabase/auth-guard";
import { createInstructorSchema } from "@/lib/schemas";
import { decryptPassword } from "@/lib/utils/encryption";


export async function GET(request: NextRequest) {
  try {
    // Fix: Permitir acceso a alumnos autenticados para que puedan ver los instructores en el calendario,
    // pero forzaremos que solo vean información 'minimal' más adelante.
    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const activeOrgId = auth.organizationId;

    const isAdmin = ["ADMIN", "COACH"].includes(auth.role);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const isActive = searchParams.get("isActive");
    let minimal = searchParams.get("minimal") === "true";

    // BARRERA DE SEGURIDAD: Los alumnos NUNCA pueden pedir la vista completa (que expone emails y teléfonos)
    if (!isAdmin) {
      minimal = true;
    }

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Use InstructorService to get instructors filtered by tenant
    const response = await instructorService.getInstructors({
      page,
      limit,
      organizationId: activeOrgId,
      search: search || undefined,
      role: role && role !== "todos" ? role : undefined,
      isActive:
        isActive && isActive !== "todos" ? isActive === "true" : undefined,
      minimal,
    });

    // Return standardized response
    return NextResponse.json(response);
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getInstructors",
      resource: "instructors",
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

    // auth.organizationId ya viene validado contra el header por requireAdminFast
    const activeOrgId = auth.organizationId;

    const parsed = createInstructorSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Determinar el rol en Supabase Auth según el rol del instructor
    // "admin" → admin en profiles, "coach" → coach en profiles
    const authRole: "coach" | "admin" =
      body.role === "admin" ? "admin" : "coach";

    // 1. Resolver contraseña del tenant según el rol
    const passwordField = authRole === "admin" ? "defaultAdminPassword" : "defaultCoachPassword";
    const org = await prisma.organization.findUnique({
      where: { id: activeOrgId },
      select: { [passwordField]: true },
    }) as Record<string, string | null> | null;
    const encryptedPassword = org?.[passwordField] ?? null;
    if (!encryptedPassword) {
      return NextResponse.json(
        { success: false, error: `El centro no tiene contraseña por defecto de ${authRole} configurada.` },
        { status: 500 }
      );
    }
    const plainPassword = decryptPassword(encryptedPassword);
    if (plainPassword.startsWith("Error")) {
      throw new Error(`[POST /api/instructors] No se pudo desencriptar ${passwordField} del centro ${activeOrgId}.`);
    }

    // 2. Crear en Supabase Authentication con contraseña del tenant
    //    Esto permite que el instructor/coach/admin pueda iniciar sesión
    try {
      await createAuthUser(body.email, authRole, plainPassword, {
        firstName: body.firstName,
        lastName: body.lastName,
      }, activeOrgId);
    } catch (authError: any) {
      const msg = authError?.message ?? "";
      if (!msg.includes("already")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTH_CREATE_FAILED",
              message: `No se pudo crear el instructor en el sistema de autenticación: ${msg}`,
            },
          },
          { status: 500 }
        );
      }
      console.warn(
        "[POST /api/instructors] Instructor already exists in Auth, continuing:",
        body.email
      );
    }

    // 2. Crear el registro del instructor en Prisma (public.instructors)
    // MT-02: Inyectar organizationId del tenant activo (header validado)
    const response = await instructorService.createInstructor({
      ...body,
      organizationId: activeOrgId,
    });

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "createInstructor",
      resource: "instructors",
    });
  }
}
