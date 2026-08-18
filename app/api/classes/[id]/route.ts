import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/lib/services/class-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { updateClassSessionSchema } from "@/lib/schemas";
import { requireAuthFast, requireAdminFast } from "@/lib/supabase/auth-guard";



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    id = (await params).id;

    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Use ClassService to get class by ID
    // Pasamos el organizationId del auth para prevenir IDOR cross-tenant
    const response = await classService.getClassById(id, auth.organizationId);

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
      operation: "getClassById",
      resource: "classes",
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
    // BUG-01: guard faltante en mutación de clase
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    const parsed = updateClassSessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const dataWithOrg = {
      ...parsed.data,
      organizationId: auth.organizationId
    };

    // Use ClassService to update class with validation
    const response = await classService.updateClass(id, dataWithOrg, auth.organizationId);

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
      operation: "updateClass",
      resource: "classes",
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
    // BUG-01: guard faltante en eliminación de clase
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Use ClassService to delete class with validation
    const response = await classService.deleteClass(id, auth.organizationId);

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
      operation: "deleteClass",
      resource: "classes",
      metadata: { id },
    });
  }
}
