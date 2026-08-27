import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { createUserSchema } from "@/lib/schemas";
import { decryptPassword } from "@/lib/utils/encryption";
import { studentService } from "@/lib/services/student-service";

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

    // 1. Resolver la contraseña del tenant (solo se usa si es Caso A, pero lo resolvemos antes para pasar a createOrAttachStudent)
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

    const result = await studentService.createOrAttachStudent(
      body,
      activeOrgId,
      plainStudentPassword
    );

    if (result.status === "error") {
      return NextResponse.json(
        { success: false, error: result.reason },
        { status: result.code === "AUTH_CREATE_FAILED" ? 500 : 400 }
      );
    }

    if (result.status === "already_in_org") {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Tanto 'created' como 'attached_existing_user' retornan el usuario actualizado
    const response = await userService.getUserById(result.userId, activeOrgId);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "createUser",
      resource: "users",
    });
  }
}
