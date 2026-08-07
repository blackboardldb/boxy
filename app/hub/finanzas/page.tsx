"use client";

import React, { useState } from "react";
import { useFinances } from "@/lib/react-query/hooks/useFinances";
import { useAdminFinanceCompare } from "@/lib/react-query/hooks/useAdminStats";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpensesManager } from "@/components/admincomponents/expenses-manager";
import { AdminPagination } from "@/components/admincomponents/admin-pagination";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

export default function FinanzasPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [page, setPage] = useState(1);

  // Parsear mes seleccionado
  const [selectedYear, selectedMonthNum] = selectedMonth.split("-").map(Number);
  const selectedMonthIndex = selectedMonthNum - 1; // JavaScript months are 0-indexed

  // Nueva carga de datos unificada (Ingresos + Egresos + Balance)
  const { data: financesData, isLoading } = useFinances(selectedYear, selectedMonthIndex + 1, page);
  const { data: financeCompare } = useAdminFinanceCompare();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonth = selectedMonth === currentMonthStr;

  const totalIngresos = financesData?.ingresos.total || 0;
  const totalEgresos = financesData?.egresos.total || 0;
  const balance = financesData?.balance || 0;
  const ingresosMes = financesData?.ingresos.items || [];
  const totalPaginas = financesData?.totalPages || 1;

  // Generar opciones de meses (últimos 12 meses)
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, "0")}`;
    const label = date
      .toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
      })
      .replace(" de ", " ");
    monthOptions.push({ value, label });
  }

  // Obtener el nombre del mes seleccionado
  const selectedMonthName = new Date(selectedYear, selectedMonthIndex)
    .toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    })
    .replace(" de ", " ");

  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    setPage(1); // Reset a primera página al cambiar mes
  };

  return (
    <div className="p-4 pt-8 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Finanzas</h1>
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards de resumen normalizadas con el estilo del Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {/* Card 1: Ingresos */}
        <Card className="rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground tracking-wider">
              Ingresos {selectedMonthName}
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          {isLoading ? (
            <div className="space-y-2 mt-2">
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-4 w-36 rounded-xl" />
            </div>
          ) : (
            <div>
              <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                ${totalIngresos.toLocaleString("es-CL")}
              </div>
              <div className="text-xs text-muted-foreground border-t border-zinc-100 pt-2 mt-2 space-y-0.5">
                <p>{financesData?.ingresos.count || 0} renovaciones procesadas</p>
                {isCurrentMonth && financeCompare && (
                  <p>
                    vs. ${financeCompare.prevRevenue.toLocaleString("es-CL")} mes anterior{" "}
                    {financeCompare.revenuePct !== null && (
                      <span className={`font-bold ${financeCompare.revenuePct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {financeCompare.revenuePct >= 0 ? "↑" : "↓"}{Math.abs(financeCompare.revenuePct)}%
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Card 2: Egresos */}
        <Card className="rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground tracking-wider">
              Egresos {selectedMonthName}
            </span>
            <TrendingDown className="h-4 w-4 text-rose-600 shrink-0" />
          </div>
          {isLoading ? (
            <div className="space-y-2 mt-2">
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-4 w-36 rounded-xl" />
            </div>
          ) : (
            <div>
              <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
                ${totalEgresos.toLocaleString("es-CL")}
              </div>
              <div className="text-xs text-muted-foreground border-t border-zinc-100 pt-2 mt-2 space-y-0.5">
                <p>{financesData?.egresos.count || 0} gastos registrados</p>
                {isCurrentMonth && financeCompare && (
                  <p>
                    vs. ${financeCompare.prevEgresos.toLocaleString("es-CL")} mes anterior{" "}
                    {financeCompare.egresosPct !== null && (
                      <span className={`font-bold ${financeCompare.egresosPct <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {financeCompare.egresosPct >= 0 ? "↑" : "↓"}{Math.abs(financeCompare.egresosPct)}%
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Card 3: Balance */}
        <Card className="rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground tracking-wider">
              Balance {selectedMonthName}
            </span>
            <DollarSign
              className={`h-4 w-4 shrink-0 ${
                balance >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            />
          </div>
          {isLoading ? (
            <div className="space-y-2 mt-2">
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-4 w-36 rounded-xl" />
            </div>
          ) : (
            <div>
              <div
                className={`text-2xl font-extrabold tracking-tight ${
                  balance >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                ${balance.toLocaleString("es-CL")}
              </div>
              <div className="text-xs text-muted-foreground border-t border-zinc-100 pt-2 mt-2 space-y-0.5">
                <p>{balance >= 0 ? "Ganancia" : "Pérdida"} del mes</p>
                {isCurrentMonth && financeCompare && (
                  <p>
                    vs. ${financeCompare.prevBalance.toLocaleString("es-CL")} mes anterior{" "}
                    {financeCompare.balancePct !== null && (
                      <span className={`font-bold ${financeCompare.balancePct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {financeCompare.balancePct >= 0 ? "↑" : "↓"}{Math.abs(financeCompare.balancePct)}%
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Card 4: Medios de Pago */}
        <Card className="rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-muted-foreground tracking-wider">
              Medios de Pago
            </span>
            <CreditCard className="h-4 w-4 text-blue-500 shrink-0" />
          </div>
          {isLoading ? (
            <div className="space-y-2 mt-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-full rounded-xl" />
              ))}
            </div>
          ) : !financesData?.ingresos.byPaymentMethod?.length ? (
            <p className="text-xs text-muted-foreground mt-3">Sin datos</p>
          ) : (
            <div className="space-y-1.5 mt-3">
              {financesData.ingresos.byPaymentMethod.map((item) => (
                <div key={item.method} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground capitalize truncate">{item.method}</span>
                  <span className="font-semibold text-zinc-900 shrink-0">${item.total.toLocaleString("es-CL")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Detalle de ingresos y egresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingresos */}
        <Card className="h-full rounded-xl flex flex-col overflow-hidden p-0 py-4">
          <CardHeader className="pt-0 pb-3 border-b px-3 sm:px-6 mb-0">
            <div>
              <span className="text-sm font-medium text-muted-foreground tracking-wider block">
                Planes contratados
              </span>
              <CardTitle className="text-lg font-bold tracking-tight capitalize">
                {selectedMonthName}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            {isLoading ? (
              <div className="space-y-3 p-3 sm:p-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : ingresosMes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 px-3">
                No hay ingresos registrados en {selectedMonthName.toLowerCase()}.
              </p>
            ) : (
              <div className="flex flex-col justify-between flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b hover:bg-slate-100 bg-slate-100">
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground pl-3 sm:pl-6 pr-1">Alumno / Plan</TableHead>
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground px-1">Fecha</TableHead>
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground text-right pr-3 sm:pr-6 pl-1">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingresosMes.map((i, idx) => (
                      <TableRow key={idx} className="hover:bg-zinc-50/50">
                        <TableCell className="py-2.5 pl-3 sm:pl-6 pr-1">
                          <p className="font-medium text-sm text-zinc-900 leading-tight">
                            {i.userName}
                          </p>
                          <span className="text-[11px] text-muted-foreground font-normal block truncate max-w-[150px] sm:max-w-none">
                            {i.planName}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 px-1 text-xs font-semibold whitespace-nowrap text-zinc-700">
                          {i.processedAt
                            ? new Date(i.processedAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })
                            : "—"}
                        </TableCell>
                        <TableCell className="py-2.5 pr-3 sm:pr-6 pl-1 text-right font-semibold text-sm text-zinc-900">
                          ${i.amount?.toLocaleString("es-CL")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Controles de paginación */}
                <div className="px-3 sm:px-6 pt-3 pb-1 border-t border-zinc-100 mt-auto">
                  <AdminPagination
                    currentPage={page}
                    totalPages={totalPaginas}
                    onPrev={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Egresos */}
        <ExpensesManager
          selectedYear={selectedYear}
          selectedMonth={selectedMonthIndex}
          selectedMonthName={selectedMonthName}
        />
      </div>
    </div>
  );
}
