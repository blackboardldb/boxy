import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/auth/require-manager";
import { decryptPassword } from "@/lib/utils/encryption";
import { studentService } from "@/lib/services/student-service";
import { rethrowIfRedirect } from "@/lib/utils/next-helpers";

// Schema acotado para las filas del CSV
// Hardcoded al caso de uso del importador: alumnos únicamente.
// role: "user" (→ ALUMNO) se fija en el handler, nunca viene del cliente.
const batchImportSchema = z.array(
  z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional().nullable(),
  })
);



export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let organizationId: string | undefined;
  let managerId: string | undefined;

  try {
    // 1. Guard: MANAGER autenticado + OWNER only
    const manager = await requireManager();
    managerId = manager.authId;

    if (manager.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Solo OWNER puede ejecutar esta acción." },
        { status: 403 }
      );
    }

    const { id } = await params;
    organizationId = id;

    // 2. Validar que el centro exista y tenga contraseña configurada (errores separados)
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { defaultStudentPassword: true },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Centro no encontrado." },
        { status: 404 }
      );
    }

    if (!org.defaultStudentPassword) {
      return NextResponse.json(
        { success: false, error: "El centro no tiene contraseña por defecto configurada." },
        { status: 500 }
      );
    }

    const plainStudentPassword = decryptPassword(org.defaultStudentPassword);
    if (plainStudentPassword.startsWith("Error")) {
      throw new Error(
        `[importar-alumnos/batch] No se pudo desencriptar defaultStudentPassword del centro ${organizationId}.`
      );
    }

    // 3. Validar payload + límite de 20 filas por lote
    const body = await req.json();
    const parsed = batchImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Formato de datos inválido." },
        { status: 400 }
      );
    }

    const rows = parsed.data;

    if (rows.length > 20) {
      return NextResponse.json(
        { success: false, error: "Máximo 20 filas por lote." },
        { status: 400 }
      );
    }

    // 4. Procesar el lote — role "user" (→ ALUMNO) fijo, nunca viene del CSV
    const results = [];
    for (const row of rows) {
      const result = await studentService.createOrAttachStudent(
        {
          ...row,
          phone: row.phone ?? undefined,
          role: "user",
        },
        organizationId,
        plainStudentPassword
      );

      results.push({ email: row.email, result });
    }

    // 5. Auditoría — no bloquea la respuesta si falla (mismo patrón que change-password)
    const summary = {
      total: rows.length,
      created:      results.filter(r => r.result.status === "created").length,
      attached:     results.filter(r => r.result.status === "attached_existing_user").length,
      alreadyInOrg: results.filter(r => r.result.status === "already_in_org").length,
      errors:       results.filter(r => r.result.status === "error").length,
    };

    try {
      await prisma.systemEvent.create({
        data: {
          organizationId,
          type: "bulk_import_students_batch",
          message: `Importación masiva de alumnos vía CSV (lote de ${rows.length})`,
          metadata: { executedByManagerId: managerId, ...summary },
        },
      });
    } catch (auditErr) {
      console.error("[importar-alumnos/batch] Error creando SystemEvent de auditoría:", auditErr);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    // Re-lanzar redirects de Next.js (requireManager) para que el framework los procese
    rethrowIfRedirect(error);

    console.error("[POST /manager/api/centros/[id]/importar-alumnos/batch]", error);
    return NextResponse.json(
      { success: false, error: "Error interno al procesar el lote." },
      { status: 500 }
    );
  }
}
