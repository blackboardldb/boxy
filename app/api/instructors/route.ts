import { NextRequest, NextResponse } from "next/server";
import { instructorService } from "@/lib/services/instructor-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { createAuthUser } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { createInstructorSchema } from "@/lib/schemas";


export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const isActive = searchParams.get("isActive");
    const minimal = searchParams.get("minimal") === "true";

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Use InstructorService to get instructors with filters
    const response = await instructorService.getInstructors({
      page,
      limit,
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
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

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

    // 1. Crear en Supabase Authentication con contraseña por defecto
    //    Esto permite que el instructor/coach/admin pueda iniciar sesión
    try {
      await createAuthUser(body.email, authRole, {
        firstName: body.firstName,
        lastName: body.lastName,
      }, auth.organizationId);
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
    const response = await instructorService.createInstructor(body);

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
