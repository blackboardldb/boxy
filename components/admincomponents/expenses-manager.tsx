"use client";

import React from "react";
import { useEgresos, useDeleteEgreso } from "@/lib/react-query/hooks/useEgresos";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const { data: egresos = [] } = useEgresos(selectedYear, selectedMonth);
  const deleteEgreso = useDeleteEgreso(selectedYear, selectedMonth);

  return (
    <Card className="h-full rounded-xl flex flex-col overflow-hidden p-0 py-4">
      <CardHeader className="pt-0 pb-3 border-b px-3 sm:px-6 mb-0 flex flex-row items-center justify-between space-y-0">
        <div>
          <span className="text-sm font-medium text-muted-foreground tracking-wider block">
            Egresos
          </span>
          <CardTitle className="text-lg font-bold tracking-tight capitalize">
            {selectedMonthName}
          </CardTitle>
        </div>
        <AddExpenseModal year={selectedYear} month={selectedMonth} />
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {egresos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 px-3">
            No hay egresos registrados en {selectedMonthName.toLowerCase()}.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-slate-100 bg-slate-100">
                <TableHead className="h-8 text-xs font-semibold text-muted-foreground pl-3 sm:pl-6 pr-1">Item</TableHead>
                <TableHead className="h-8 text-xs font-semibold text-muted-foreground px-1">Fecha</TableHead>
                <TableHead className="h-8 text-xs font-semibold text-muted-foreground text-right px-1">Monto</TableHead>
                <TableHead className="h-8 text-xs font-semibold text-muted-foreground text-right pr-3 sm:pr-6 pl-1 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {egresos.map((e) => (
                <TableRow key={e.id} className="hover:bg-zinc-50/50">
                  <TableCell className="py-2.5 pl-3 sm:pl-6 pr-1 font-medium text-sm text-zinc-900">
                    {e.motivo}
                  </TableCell>
                  <TableCell className="py-2.5 px-1 text-xs font-semibold whitespace-nowrap text-zinc-700">
                    {e.fecha ? new Date(e.fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short" }) : "—"}
                  </TableCell>
                  <TableCell className="py-2.5 px-1 text-right font-semibold text-sm text-zinc-900">
                    ${e.monto.toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="py-2.5 pr-3 sm:pr-6 pl-1 text-right">
                    <button
                      onClick={() => deleteEgreso.mutate(e.id)}
                      disabled={deleteEgreso.isPending}
                      title="Eliminar egreso"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
