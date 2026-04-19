import { NextRequest, NextResponse } from "next/server";
import { organizationService } from "@/lib/services/organization-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { updateOrganizationSchema } from "@/lib/schemas";


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
    const rawBody = await request.json();
    const { id, ...data } = rawBody;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de organización requerido" },
        { status: 400 }
      );
    }

    const parsed = updateOrganizationSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const response = await organizationService.update(id, parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "updateOrganization",
      resource: "organizations",
    });
  }
}
