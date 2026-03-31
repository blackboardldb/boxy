import { NextRequest, NextResponse } from "next/server";
import { OrganizationService } from "@/lib/services/organization-service";
import { ErrorHandler } from "@/lib/errors/handler";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/auth-guard";

const organizationService = new OrganizationService();

export async function GET() {
  try {
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId } = auth;
    console.log("[DEBUG] Executing direct prisma.organization.findUnique for ID:", organizationId);

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    return NextResponse.json({ success: true, data: organization });
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
