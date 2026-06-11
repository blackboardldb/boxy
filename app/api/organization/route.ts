import { NextRequest, NextResponse } from "next/server";
import { organizationService } from "@/lib/services/organization-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-guard";
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
    // MT-04: Requerir admin autenticado — el target es siempre la org del admin
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const rawBody = await request.json();
    // MT-04: Ignorar el `id` del body — usamos auth.organizationId como fuente de verdad.
    // Si el cliente envía un id diferente, lo descartamos silenciosamente.
    const { id: _ignored, ...data } = rawBody;
    const id = auth.organizationId;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "No se pudo determinar la organización del administrador." },
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

    const response = await organizationService.update(
      id,
      parsed.data as Partial<import("@/lib/types").Organization>
    );
    return NextResponse.json(response);
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "updateOrganization",
      resource: "organizations",
    });
  }
}
