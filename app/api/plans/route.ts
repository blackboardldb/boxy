import { NextRequest, NextResponse } from "next/server";
import { PlanService } from "@/lib/services/plan-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-guard";

// Initialize services
const planService = new PlanService();

export async function GET(request: NextRequest) {
  try {
    // Autenticación básica
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

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

    // Use PlanService to get plans with filters
    const response = await planService.getPlans({
      page,
      limit,
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
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Use PlanService to create plan with validation
    const response = await planService.createPlan(body);

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
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Use PlanService to update plan with validation
    const response = await planService.updatePlan(id, updateData);

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
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Use PlanService to delete plan with validation
    const response = await planService.deletePlan(id);

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


