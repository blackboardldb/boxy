import { NextRequest, NextResponse } from "next/server";
import { planService } from "@/lib/services/plan-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { requireAuthFast, requireAdminFast } from "@/lib/supabase/auth-guard";
import { createPlanSchema, updatePlanSchema } from "@/lib/schemas";


export async function GET(request: NextRequest) {
  try {
    // Autenticación básica (MT-07)
    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const activeOrgId = auth.organizationId;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // MT-01: Filtrar planes por organizationId del tenant activo
    const response = await planService.getPlans({
      page,
      limit,
      organizationId: activeOrgId,
      search: search || undefined,
      isActive:
        isActive && isActive !== "todos" ? isActive === "true" : undefined,
    });

    // Return standardized response
    return NextResponse.json(response);
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getPlans",
      resource: "plans",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Solo administradores pueden crear planes
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // auth.organizationId ya viene validado contra el header por requireAdminFast
    const activeOrgId = auth.organizationId;

    const parsed = createPlanSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // MT-01: Inyectar organizationId del tenant activo al crear el plan
    const response = await planService.createPlan({
      ...parsed.data,
      organizationId: activeOrgId,
    });

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "createPlan",
      resource: "plans",
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Solo administradores pueden actualizar planes
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // auth.organizationId ya viene validado contra el header por requireAdminFast
    const activeOrgId = auth.organizationId;

    const rawBody = await request.json();
    const { id, ...updateData } = rawBody;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const parsed = updatePlanSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Use PlanService to update plan with validation
    const response = await planService.updatePlan(id, parsed.data, activeOrgId);

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
      operation: "updatePlan",
      resource: "plans",
    });
  }
}

export async function DELETE(request: NextRequest) {
  let id: string | null = null;
  try {
    // Solo administradores pueden eliminar planes
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // auth.organizationId ya viene validado contra el header por requireAdminFast
    const activeOrgId = auth.organizationId;

    const { searchParams } = new URL(request.url);
    id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Use PlanService to delete plan with validation
    const response = await planService.deletePlan(id, activeOrgId);

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
      operation: "deletePlan",
      resource: "plans",
      metadata: { id: id ?? undefined },
    });
  }
}


