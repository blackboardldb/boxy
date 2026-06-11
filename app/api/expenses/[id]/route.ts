import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { updateExpenseSchema } from "@/lib/schemas";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Autenticación y Autorización (faltaba en la versión anterior)
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "ID requerido",
            details: "Se debe proporcionar un ID válido",
          },
        },
        { status: 400 }
      );
    }

    // Verificar que el egreso pertenece a la organización del admin (evita borrado cross-tenant)
    const existing = await prisma.expense.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Egreso no encontrado",
            details: `No se encontró un egreso con ID: ${id}`,
          },
        },
        { status: 404 }
      );
    }

    if (existing.organizationId !== auth.organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No autorizado" },
        },
        { status: 403 }
      );
    }

    try {
      const deletedExpense = await prisma.expense.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        data: deletedExpense,
        message: "Egreso eliminado exitosamente",
      });
    } catch (dbError: any) {
      if (dbError.code === "P2025") {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Egreso no encontrado",
              details: `No se encontró un egreso con ID: ${id}`,
            },
          },
          { status: 404 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Error deleting expense",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Autenticación y Autorización
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "ID requerido",
            details: "Se debe proporcionar un ID válido",
          },
        },
        { status: 400 }
      );
    }

    const parsed = updateExpenseSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { motivo, fecha, monto } = parsed.data;

    // Verificar que el egreso pertenece a la organización del admin (evita mutación cross-tenant)
    const existing = await prisma.expense.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Egreso no encontrado",
            details: `No se encontró un egreso con ID: ${id}`,
          },
        },
        { status: 404 }
      );
    }

    if (existing.organizationId !== auth.organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No autorizado" },
        },
        { status: 403 }
      );
    }

    // Actualizar en DB
    try {
      const updatedExpense = await prisma.expense.update({
        where: { id },
        data: {
          ...(motivo && { motivo: motivo.trim() }),
          ...(fecha && { fecha: new Date(fecha) }),
          ...(monto && { monto: Number(monto) }),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedExpense,
          fecha: updatedExpense.fecha.toISOString(),
          createdAt: updatedExpense.createdAt.toISOString(),
          updatedAt: updatedExpense.updatedAt.toISOString(),
        },
        message: "Egreso actualizado exitosamente",
      });
    } catch (dbError: any) {
      if (dbError.code === "P2025") {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Egreso no encontrado",
              details: `No se encontró un egreso con ID: ${id}`,
            },
          },
          { status: 404 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Error updating expense",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
