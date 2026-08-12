import { NextRequest, NextResponse } from "next/server";
import { disciplineService } from "@/lib/services/discipline-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { updateDisciplineSchema } from "@/lib/schemas";
import { requireAuthFast, requireAdminFast } from "@/lib/supabase/auth-guard";
import { generateClassesFromSchedules } from "@/lib/utils/class-generator";


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
        { error: "Discipline ID is required" },
        { status: 400 }
      );
    }

    // Use DisciplineService to get discipline by ID and filter by organizationId
    const response = await disciplineService.getDisciplineById(id, auth.organizationId);

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
      operation: "getDisciplineById",
      resource: "disciplines",
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

    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Discipline ID is required" },
        { status: 400 }
      );
    }

    const parsed = updateDisciplineSchema.safeParse(await request.json());
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

    // Use DisciplineService to update discipline with validation
    const response = await disciplineService.updateDiscipline(id, dataWithOrg, auth.organizationId);

    if (response.success && parsed.data.schedule) {
      try {
        await generateClassesFromSchedules(auth.organizationId, undefined, undefined, id);
      } catch (err) {
        console.error("Error regenerando clases tras editar disciplina:", err);
      }
    }

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
      operation: "updateDiscipline",
      resource: "disciplines",
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
    id = (await params).id;

    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Discipline ID is required" },
        { status: 400 }
      );
    }

    // Use DisciplineService to delete discipline with validation
    const response = await disciplineService.deleteDiscipline(id, auth.organizationId);

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
      operation: "deleteDiscipline",
      resource: "disciplines",
      metadata: { id },
    });
  }
}
