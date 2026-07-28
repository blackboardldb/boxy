import { NextRequest, NextResponse } from "next/server";
import { instructorService } from "@/lib/services/instructor-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { updateInstructorSchema } from "@/lib/schemas";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-guard";



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Use InstructorService to get instructor by ID
    const response = await instructorService.getInstructorById(id);

    if (!response.success || !response.data) {
      return NextResponse.json(
        { success: false, error: "Instructor not found" },
        { status: 404 }
      );
    }

    // Return standardized response
    return NextResponse.json(response);
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getInstructorById",
      resource: "instructors",
      metadata: { id: (await params).id },
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // BUG-01: guard faltante en actualización de instructor
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const parsed = updateInstructorSchema.safeParse(await request.json());
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

    // Use InstructorService to update instructor with validation
    const response = await instructorService.updateInstructor(id, dataWithOrg, auth.organizationId);

    if (!response.success) {
      return NextResponse.json(response, {
        status: 400,
      });
    }

    // Return standardized response
    return NextResponse.json(response);
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "updateInstructor",
      resource: "instructors",
      metadata: { id: (await params).id },
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // BUG-01: guard faltante en eliminación de instructor
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    // Use InstructorService to delete instructor with validation
    const response = await instructorService.deleteInstructor(id, auth.organizationId);

    if (!response.success) {
      return NextResponse.json(response, {
        status: response.error?.message?.includes("not found") ? 404 : 400,
      });
    }

    // Return standardized response
    return NextResponse.json({
      success: true,
      message: "Instructor deleted successfully",
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "deleteInstructor",
      resource: "instructors",
      metadata: { id: (await params).id },
    });
  }
}
