import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { decryptPassword } from "@/lib/utils/encryption";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar autenticación y tenant
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 2. Restricción adicional estricta: solo ADMIN
    if (auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Solo los administradores pueden resetear contraseñas." },
        { status: 403 }
      );
    }

    // 3 & 4. Resolución de IDs
    const activeOrgId = auth.organizationId;
    const { id } = await params;

    // 5. Búsqueda scoped por PK compuesta (garantiza aislamiento de tenant)
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: id,
          organizationId: activeOrgId,
        },
      },
      include: {
        user: true,
      },
    });

    // 6. Validación de existencia en el centro
    if (!member) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado en este centro." },
        { status: 404 }
      );
    }

    // 7. Buscar la organización para leer defaultStudentPassword
    const org = await prisma.organization.findUnique({
      where: { id: activeOrgId },
      select: { defaultStudentPassword: true },
    });

    // 8. Validación de contraseña por defecto configurada (evita hardcodes)
    if (!org?.defaultStudentPassword) {
      return NextResponse.json(
        { success: false, error: "El centro no tiene una contraseña por defecto configurada." },
        { status: 400 }
      );
    }

    // 9. Desencriptar la contraseña
    const plainPassword = decryptPassword(org.defaultStudentPassword);

    // 10. Update a Supabase Auth
    const supabase = createAdminClient();
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      member.user.authId,
      { password: plainPassword }
    );

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 11. Auditoría
    const actorId = auth.dbUserId || auth.user.id;
    await prisma.systemEvent.create({
      data: {
        organizationId: activeOrgId,
        type: "password_reset_by_admin",
        message: `El administrador ${actorId} reseteó la contraseña del usuario ${id}.`,
        metadata: {
          actorId,
          targetUserId: id,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Contraseña reseteada con éxito a la clave por defecto del centro.`,
    });
  } catch (error) {
    console.error("[POST /api/users/[id]/reset-password]", error);
    return NextResponse.json(
      { success: false, error: "Error inesperado al resetear contraseña." },
      { status: 500 }
    );
  }
}
