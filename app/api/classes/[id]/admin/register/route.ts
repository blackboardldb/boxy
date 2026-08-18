import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/lib/services/class-service";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { z } from "zod";
import { prisma } from "@/lib/prisma";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // BUG-01: guard faltante — cualquier actor podía inscribir alumnos con isAdmin:true sin autenticarse
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { organizationId } = auth;

    const { id: classId } = await params;

    // FIX: Prevenir Tenant Spoofing validando que la clase pertenece al admin usando findFirst (id no es unique con org)
    const targetClass = await prisma.classSession.findFirst({
      where: { id: classId, organizationId },
      select: { id: true }
    });
    if (!targetClass) {
      return NextResponse.json({ error: "Clase no encontrada o acceso denegado" }, { status: 404 });
    }

    const bodySchema = z.object({ userId: z.string().min(1) });
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { userId } = parsed.data;

    // NOTA DE ARQUITECTURA: La seguridad cross-tenant de este endpoint depende 100%
    // de que `getUserScopedToOrg` devuelva `null` para alumnos de otros tenants.
    // Al pasar { isAdmin: true }, se salta ValidationService.canUserRegisterToClass.
    // Si `getUserScopedToOrg` volviera a ser fail-open, este endpoint permitiría
    // inyectar alumnos cruzados.
    const result = await classService.registerStudent(classId, userId, { isAdmin: true });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || "Error al inscribir al usuario" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Usuario agregado exitosamente",
      class: result.data,
    });
  } catch (error) {
    console.error("Error adding user to class:", error);
    return NextResponse.json(
      { error: "Error al agregar usuario" },
      { status: 500 }
    );
  }
}
