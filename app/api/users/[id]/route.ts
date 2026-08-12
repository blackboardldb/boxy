import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { adminUpdateUserSchema, updateProfileSchema } from "@/lib/schemas";
import { requireAuthFast, requireSelfOrAdminFast, requireAdminFast } from "@/lib/supabase/auth-guard";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    // HAL-18 (cerrado en Grupo 3): requireAuth() bloquea acceso anónimo;
    // getUserById ahora scoped a organizationId para prevenir fuga de PII cross-tenant.
    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    id = (await params).id;

    const response = await userService.getUserById(id, auth.organizationId);

    return NextResponse.json(response, {
      status: response.success && response.data ? 200 : 404,
    });
  } catch (error) {
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
    id = (await params).id;

    // BUG-03: exigir sesión activa antes de cualquier mutación
    const auth = await requireSelfOrAdminFast(request, id);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const isAdmin = ["ADMIN", "COACH"].includes(auth.role);

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

    // MT-07 (Bloque 5A-1): pasar organizationId del actor autenticado para aislamiento de tenant
    const response = await userService.updateUser(id, body, auth.organizationId);

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
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    id = (await params).id;

    // MT-07 (Bloque 5A-1): pasar organizationId del actor autenticado para aislamiento de tenant
    const response = await userService.deleteUser(id, auth.organizationId);

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
