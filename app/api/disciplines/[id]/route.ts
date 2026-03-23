import { NextRequest, NextResponse } from "next/server";
import { DisciplineService } from "@/lib/services/discipline-service";
import { ErrorHandler } from "@/lib/errors/handler";

// Initialize services
const disciplineService = new DisciplineService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { error: "Discipline ID is required" },
        { status: 400 }
      );
    }

    // Use DisciplineService to get discipline by ID
    const response = await disciplineService.getDisciplineById(id);

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
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Discipline ID is required" },
        { status: 400 }
      );
    }

    // Use DisciplineService to update discipline with validation
    const response = await disciplineService.updateDiscipline(id, body);

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

    if (!id) {
      return NextResponse.json(
        { error: "Discipline ID is required" },
        { status: 400 }
      );
    }

    // Use DisciplineService to delete discipline with validation
    const response = await disciplineService.deleteDiscipline(id);

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
