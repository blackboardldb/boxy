import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { createExpenseSchema } from "@/lib/schemas";
import { startOfMonthChile, endOfMonthChile } from "@/lib/utils";

// Tipo para el egreso
export type Expense = {
  id: string;
  organizationId: string;
  motivo: string;
  fecha: string; // ISO date
  monto: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function GET(request: NextRequest) {
  try {
    // 0. Autenticación y Autorización
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    try {
      let dbExpenses;

      if (year && month) {
        const targetYear = parseInt(year);
        const targetMonth = parseInt(month); // 0-indexed

        // targetMonth es 0-indexed (convención existente en este endpoint).
        // Rango de mes en horario de Chile — ver lib/utils.ts
        const startDate = startOfMonthChile(targetYear, targetMonth);
        const endDate   = endOfMonthChile(targetYear, targetMonth); // límite exclusivo

        dbExpenses = await prisma.expense.findMany({
          where: {
            organizationId: auth.organizationId,
            fecha: {
              gte: startDate,
              lt: endDate,
            },
          },
          orderBy: {
            fecha: "desc",
          },
        });
      } else {
        dbExpenses = await prisma.expense.findMany({
          where: {
            organizationId: auth.organizationId,
          },
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
    // 0. Autenticación y Autorización
    const auth = await requireAdminFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const parsed = createExpenseSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { motivo, fecha, monto } = parsed.data;

    try {
      const newExpense = await prisma.expense.create({
        data: {
          organizationId: auth.organizationId, // ← Siempre desde el auth-guard
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
