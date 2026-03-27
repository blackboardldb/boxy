import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tipo para el egreso
export type Expense = {
  id: string;
  motivo: string;
  fecha: string; // ISO date
  monto: number;
  createdAt?: string;
  updatedAt?: string;
};

// El mock storage se ha movido/eliminado para usar solo Prisma

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    try {
      // Intentar usar Prisma primero
      let dbExpenses;

      if (year && month) {
        const targetYear = parseInt(year);
        const targetMonth = parseInt(month); // 0-indexed

        // Crear fechas de inicio y fin del mes
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        dbExpenses = await prisma.expense.findMany({
          where: {
            fecha: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            fecha: "desc",
          },
        });
      } else {
        dbExpenses = await prisma.expense.findMany({
          orderBy: {
            fecha: "desc",
          },
        });
      }

      // Convertir fechas a string para compatibilidad
      const formattedExpenses = dbExpenses.map((expense) => ({
        ...expense,
        fecha: expense.fecha.toISOString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: formattedExpenses,
        total: formattedExpenses.length,
      });
    } catch (dbError) {
      console.error("Database error in GET expenses:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Error fetching expenses from database",
            details: dbError instanceof Error ? dbError.message : String(dbError),
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Critical error fetching expenses:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { motivo, fecha, monto } = body;

    // Validación básica
    if (!motivo || !fecha || !monto) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Faltan campos requeridos",
            details: "motivo, fecha y monto son requeridos",
          },
        },
        { status: 400 }
      );
    }

    if (typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Monto inválido",
            details: "El monto debe ser un número positivo",
          },
        },
        { status: 400 }
      );
    }

    try {
      // Intentar usar Prisma primero
      const newExpense = await prisma.expense.create({
        data: {
          motivo: motivo.trim(),
          fecha: new Date(fecha),
          monto: Number(monto),
        },
      });

      // Convertir fechas a string para compatibilidad
      const formattedExpense = {
        ...newExpense,
        fecha: newExpense.fecha.toISOString(),
        createdAt: newExpense.createdAt.toISOString(),
        updatedAt: newExpense.updatedAt.toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: formattedExpense,
        message: "Egreso creado exitosamente",
      });
    } catch (dbError) {
      console.error("Database error in POST expenses:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Error creating expense in database",
            details: dbError instanceof Error ? dbError.message : String(dbError),
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Critical error creating expense:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
