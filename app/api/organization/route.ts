import { NextRequest, NextResponse } from "next/server";
import { OrganizationService } from "@/lib/services/organization-service";
import { ErrorHandler } from "@/lib/errors/handler";

const organizationService = new OrganizationService();

export async function GET() {
  try {
    const response = await organizationService.getOrganization();
    return NextResponse.json(response);
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "getOrganization",
      resource: "organizations",
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de organización requerido" },
        { status: 400 }
      );
    }

    const response = await organizationService.update(id, data);
    return NextResponse.json(response);
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "updateOrganization",
      resource: "organizations",
    });
  }
}
