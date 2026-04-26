"use client";

import React, { useState, useEffect } from "react";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useEgresos } from "@/lib/react-query/hooks/useEgresos";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpensesManager } from "@/components/admincomponents/expenses-manager";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { parseISO } from "date-fns";

export default function FinanzasPage() {
  const users = useBlackSheepStore((s) => s.users);
  const fetchUsers = useBlackSheepStore((s) => s.fetchUsers);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  // Cargar datos iniciales
  useEffect(() => {
    // Solo cargar usuarios si no existen (Punto 1 matizado)
    if (users.length === 0) {
      fetchUsers(1, 1000);
    }
    // fetchEgresos() redundante eliminado de aquí; lo gestiona ExpensesManager
  }, [fetchUsers, users.length]);

  // Parsear mes seleccionado
  const [selectedYear, selectedMonthNum] = selectedMonth.split("-").map(Number);
  const selectedMonthIndex = selectedMonthNum - 1; // JavaScript months are 0-indexed

  // Egresos del mes seleccionado — React Query filtra en el servidor por (year, month)
  const { data: egresos = [] } = useEgresos(selectedYear, selectedMonthIndex);

  // Filtrar ingresos del mes seleccionado
  const ingresosMes = users
    .filter(
      (u) =>
        u.membership &&
        u.membership.status === "active" &&
        u.membership.currentPeriodStart &&
        parseISO(u.membership.currentPeriodStart.substring(0, 10)).getFullYear() ===
          selectedYear &&
        parseISO(u.membership.currentPeriodStart.substring(0, 10)).getMonth() ===
          selectedMonthIndex
    )
    .map((u) => ({
      nombre: `${u.firstName} ${u.lastName}`,
      plan: u.membership?.membershipType,
      fecha: u.membership?.currentPeriodStart,
      precio: u.membership?.monthlyPrice,
    }));

  // Calcular totales
  const totalIngresos = ingresosMes.reduce(
    (sum, i) => sum + (i.precio || 0),
    0
  );
  const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0);
  const balance = totalIngresos - totalEgresos;

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

  return (
    <div className="p-4 pt-8 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Finanzas</h1>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
            <div className="text-2xl font-bold text-green-600">
              ${totalIngresos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {ingresosMes.length} membresías activas
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
            <div className="text-2xl font-bold text-red-600">
              ${totalEgresos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {egresos.length} gastos registrados
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
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? "Ganancia" : "Pérdida"} del mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de ingresos y egresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingresos */}
        <Card className="h-full rounded-xl">
          <CardHeader>
            <p className="text-lg font-bold ">Planes contratados <span className=" font-medium ">{selectedMonthName}</span></p>
          </CardHeader>
          <CardContent>
            {ingresosMes.length === 0 ? (
              <div className="text-muted-foreground">
                No hay ingresos registrados en {selectedMonthName.toLowerCase()}
                .
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {ingresosMes.map((i, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <div className="font-medium text-sm">{i.nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        {i.plan} |{" "}
                        {i.fecha && parseISO(i.fecha.substring(0, 10)).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="font-semibold">
                      ${i.precio?.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
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
