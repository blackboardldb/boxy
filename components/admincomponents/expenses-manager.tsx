"use client";

import React, { useEffect } from "react";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddExpenseModal } from "./add-expense-modal";
import { Trash2 } from "lucide-react";

interface ExpensesManagerProps {
  selectedYear: number;
  selectedMonth: number; // 0-indexed (0 = enero, 11 = diciembre)
  selectedMonthName: string;
}

export function ExpensesManager({
  selectedYear,
  selectedMonth,
  selectedMonthName,
}: ExpensesManagerProps) {
  const egresos = useBlackSheepStore((s) => s.egresos);
  const fetchEgresos = useBlackSheepStore((s) => s.fetchEgresos);
  const deleteEgreso = useBlackSheepStore((s) => s.deleteEgreso);

  useEffect(() => {
    fetchEgresos(selectedYear, selectedMonth);
  }, [fetchEgresos, selectedYear, selectedMonth]);

  // Filtrar egresos del mes seleccionado
  const egresosMes = egresos.filter((e) => {
    const d = new Date(e.fecha);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  return (
    <Card className="h-full rounded-xl">
      <CardHeader>
        <p className="text-lg font-bold ">Egresos <span className=" font-medium ">{selectedMonthName}</span></p>
        <AddExpenseModal onSuccess={() => fetchEgresos(selectedYear, selectedMonth)} />
      </CardHeader>
      <CardContent>
        {egresosMes.length === 0 ? (
          <div className="text-muted-foreground">
            No hay egresos registrados en {selectedMonthName.toLowerCase()}.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {egresosMes.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{e.motivo}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.fecha).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    ${e.monto.toLocaleString()}
                  </span>
                   <Button
                    onClick={() => deleteEgreso(e.id)}
                    title="Eliminar egreso"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 w-10 rounded-xl"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
