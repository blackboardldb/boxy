import { NextRequest, NextResponse } from "next/server";
import { planService } from "@/lib/services/plan-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { updatePlanSchema } from "@/lib/schemas";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Use PlanService to get plan by ID
    const response = await planService.getPlanById(id);

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
      operation: "getPlanById",
      resource: "plans",
      metadata: { id: (await params).id },
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const parsed = updatePlanSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Use PlanService to update plan with validation
    const response = await planService.updatePlan(id, parsed.data);

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
      metadata: { id: (await params).id },
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
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
      metadata: { id: (await params).id },
    });
  }
}
