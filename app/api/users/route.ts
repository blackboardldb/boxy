import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { createAuthUser } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { createUserSchema } from "@/lib/schemas";

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

    // Use UserService to get users with filters
    const response = await userService.getUsers({
      page,
      limit,
      search: search || undefined,
      role: role || undefined,
      status: status || undefined,
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

    try {
      console.log("[POST /api/users] Creando usuario en Supabase Auth:", body.email);
      await createAuthUser(
        body.email,
        "alumno", // Los usuarios creados desde el panel son alumnos por defecto
        {
          firstName: body.firstName,
          lastName: body.lastName,
        }
      );
    } catch (authError: any) {
      // Si el error es que ya existe en Auth, no bloqueamos la creación en Prisma
      const msg = authError?.message ?? "";
      console.error("[POST /api/users] Error en createAuthUser:", msg);
      
      if (!msg.includes("already")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTH_CREATE_FAILED",
              message: `No se pudo crear el usuario en el sistema de autenticación: ${msg}`,
            },
          },
          { status: 500 }
        );
      }
      console.warn(
        "[POST /api/users] User already exists in Auth, continuing with Prisma creation:",
        body.email
      );
    }

    // 2. Crear el perfil de usuario en Prisma (public.users)
    const response = await userService.createUser(body);

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "createUser",
      resource: "users",
    });
  }
}

