import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptPassword } from "@/lib/utils/encryption";
import { rethrowIfRedirect } from "@/lib/utils/next-helpers";

/**
 * POST /manager/api/centros/[id]/reset-admin-passwords
 * Aplica la defaultAdminPassword del centro a todos los usuarios con rol ADMIN.
 * Uso de rescate: cuando un admin no puede acceder y el Manager necesita restablecer su clave.
 * Requiere: sesión de Manager válida.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireManager();
    const { id: orgId } = await params;
    const managerId = auth.authId || "manager";

    // 1. Obtener el centro y su contraseña de admin por defecto
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, slug: true, defaultAdminPassword: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Centro no encontrado." }, { status: 404 });
    }

    if (!org.defaultAdminPassword) {
      return NextResponse.json(
        {
          error:
            "El centro no tiene una contraseña de administrador por defecto configurada. Generá una desde la sección de contraseñas primero.",
        },
        { status: 400 }
      );
    }

    const plainAdminPassword = decryptPassword(org.defaultAdminPassword);

    // 2. Buscar todos los admins del centro (scoped por orgId)
    const adminMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: orgId,
        role: "ADMIN",
      },
      include: {
        user: {
          select: { authId: true, id: true },
        },
      },
    });

    if (adminMembers.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron administradores en este centro." },
        { status: 404 }
      );
    }

    // 3. Aplicar la contraseña a cada admin en Supabase
    const supabase = createAdminClient();
    const results: { userId: string; ok: boolean; error?: string }[] = [];

    for (const member of adminMembers) {
      const { error } = await supabase.auth.admin.updateUserById(member.user.authId, {
        password: plainAdminPassword,
      });
      results.push({
        userId: member.user.id,
        ok: !error,
        ...(error ? { error: error.message } : {}),
      });
    }

    const failedCount = results.filter((r) => !r.ok).length;

    // 4. Auditoría
    await prisma.systemEvent.create({
      data: {
        organizationId: orgId,
        type: "admin_password_reset_by_manager",
        message: `El manager ${managerId} restableció la contraseña de ${adminMembers.length} administrador(es) a la clave por defecto del centro. Fallidos: ${failedCount}.`,
        metadata: {
          managerId,
          results,
          timestamp: new Date().toISOString(),
        },
      },
    });

    if (failedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Se actualizaron ${results.length - failedCount} de ${results.length} administradores. Hubo ${failedCount} error(es).`,
          results,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Contraseña de ${adminMembers.length} administrador(es) restablecida a la clave por defecto del centro.`,
      count: adminMembers.length,
    });
  } catch (error: any) {
    rethrowIfRedirect(error);
    console.error("[POST /manager/api/centros/[id]/reset-admin-passwords]", error);
    return NextResponse.json(
      { error: error.message || "Error al restablecer contraseñas de administrador." },
      { status: 500 }
    );
  }
}
