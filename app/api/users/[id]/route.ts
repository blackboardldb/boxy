import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { adminUpdateUserSchema, updateProfileSchema } from "@/lib/schemas";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-guard";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    id = (await params).id;

    // Use UserService to get user by ID
    const response = await userService.getUserById(id);

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success && response.data ? 200 : 404,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getUserById",
      resource: "users",
      metadata: { id },
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    // BUG-03: exigir sesión activa antes de cualquier mutación
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    id = (await params).id;

    const isAdmin = ["ADMIN", "COACH"].includes(auth.role);

    // BUG-03: un alumno solo puede editar su propio perfil
    if (!isAdmin && auth.user.id !== id) {
      return NextResponse.json(
        { error: "Sin permisos para editar este perfil" },
        { status: 403 }
      );
    }

    // BUG-03: admins usan el schema completo; alumnos usan el schema restringido
    // (excluye role, organizationId, planId, membership — previene escalación de privilegios)
    const schema = isAdmin ? adminUpdateUserSchema : updateProfileSchema;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Use UserService to update user with validation
    const response = await userService.updateUser(id, body);

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success
        ? 200
        : response.error?.code === "NOT_FOUND"
        ? 404
        : 400,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "updateUser",
      resource: "users",
      metadata: { id },
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    // Paso 4: Seguridad — solo admins pueden eliminar alumnos
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    id = (await params).id;

    // Use UserService to delete user (soft delete)
    const response = await userService.deleteUser(id);

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success
        ? 200
        : response.error?.code === "NOT_FOUND"
        ? 404
        : 400,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "deleteUser",
      resource: "users",
      metadata: { id },
    });
  }
}
