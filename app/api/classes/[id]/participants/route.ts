import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { ErrorHandler } from "@/lib/errors/handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = "unknown";
  try {
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const activeOrgId = request.headers.get("x-organization-id");
    if (!activeOrgId) {
      return NextResponse.json({ error: "Tenant no resuelto" }, { status: 400 });
    }

    id = (await params).id;

    if (!id) {
      return NextResponse.json({ error: "ID de clase requerido" }, { status: 400 });
    }

    const registrations = await prisma.classRegistration.findMany({
      where: {
        classId: id,
        class: { organizationId: activeOrgId }, // Scope: clase debe pertenecer al tenant del admin
        status: "registered",
      },
      select: {
        userId: true,
        registeredAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            // Filtrado por org para que [0] sea determinista en usuarios multi-tenant (Nivel 4)
            userMembership: {
              where: { organizationId: activeOrgId },
              select: { membershipType: true },
            },
          },
        },
      },
      orderBy: { registeredAt: "asc" },
    });

    // Mapear a un formato más útil para el Drawer
    // Ocultar PII (email/teléfono) si el usuario no es admin o coach del tenant
    const isAdminOrCoach = auth.role === "ADMIN" || auth.role === "COACH";
    
    const participants = registrations.map((reg) => ({
      userId: reg.user.id,
      firstName: reg.user.firstName,
      lastName: reg.user.lastName,
      email: isAdminOrCoach ? reg.user.email : null,
      phone: isAdminOrCoach ? reg.user.phone : null,
      membershipType: reg.user.userMembership?.[0]?.membershipType ?? "Sin plan",
      bookedAt: reg.registeredAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: participants,
    });
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "getClassParticipants",
      resource: "classes",
      metadata: { id },
    });
  }
}
