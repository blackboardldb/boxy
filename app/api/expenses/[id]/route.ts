import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Intentar eliminar del DB (Prisma)
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
      // Prisma error for not found (P2025)
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
    const { id } = await params;
    const body = await request.json();
    const { motivo, fecha, monto } = body;

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
