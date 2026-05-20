"use client";

import React, { useState } from "react";
import { useFinances } from "@/lib/react-query/hooks/useFinances";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpensesManager } from "@/components/admincomponents/expenses-manager";
import { AdminPagination } from "@/components/admincomponents/admin-pagination";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

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

  const totalIngresos = financesData?.ingresos.total || 0;
  const totalEgresos = financesData?.egresos.total || 0;
  const balance = financesData?.balance || 0;
  const ingresosMes = financesData?.ingresos.items || [];
  const totalPaginas = financesData?.totalPages || 1;

  // Generar opciones de meses (últimos 12 meses)
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, "0")}`;
    const label = date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
    monthOptions.push({ value, label });
  }

  // Obtener el nombre del mes seleccionado
  const selectedMonthName = new Date(
    selectedYear,
    selectedMonthIndex
  ).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

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

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos {selectedMonthName}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-zinc-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${totalIngresos.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {financesData?.ingresos.count || 0} renovaciones procesadas
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Egresos de {selectedMonthName}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-zinc-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                ${totalEgresos.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {financesData?.egresos.count || 0} gastos registrados
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance </CardTitle>
            <DollarSign
              className={`h-4 w-4 ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-zinc-100 animate-pulse rounded" />
            ) : (
              <div
                className={`text-2xl font-bold ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${balance.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? "Ganancia" : "Pérdida"} del mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de ingresos y egresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingresos */}
        <Card className="h-full rounded-xl flex flex-col">
          <CardHeader>
            <p className="text-lg font-bold ">
              Planes contratados{" "}
              <span className=" font-medium ">{selectedMonthName}</span>
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 w-full bg-zinc-100 animate-pulse rounded" />
                ))}
              </div>
            ) : ingresosMes.length === 0 ? (
              <div className="text-muted-foreground">
                No hay ingresos registrados en {selectedMonthName.toLowerCase()}.
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-200">
                  {ingresosMes.map((i, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <div className="font-medium text-sm">{i.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {i.planName} |{" "}
                          {i.processedAt &&
                            new Date(i.processedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-semibold">
                        ${i.amount?.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Controles de paginación */}
                <AdminPagination
                  currentPage={page}
                  totalPages={totalPaginas}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                />
              </>
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
