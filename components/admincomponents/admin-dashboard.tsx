"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  AlertTriangle,
  Zap,
  Heart,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import type { FitCenterUserProfile } from "@/lib/types";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { getPlanStatus } from "@/lib/utils";

export function AdminDashboard() {
  const { users = [], fetchUsers, egresos = [] } = useBlackSheepStore();
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de usuarios al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchUsers(1, 1000); // Cargar todos los usuarios para el dashboard
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchUsers]);

  // Memoizar estadísticas principales
  const stats = useMemo(() => {
    // Al filtrar para el dashboard, solo consideramos alumnos (sin rol o rol user)
    const students = users.filter((u) => !u.role || u.role === "user");
    const totalMembers = students.length;

    // Calcular estados reales usando getPlanStatus
    const statusCounts = students.reduce(
      (acc, s) => {
        const status = getPlanStatus(s);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { active: 0, scheduled: 0, pending: 0, inactive: 0 } as Record<
        string,
        number
      >
    );

    // Para el usuario: activos + programados suelen considerarse "vigentes" en el counter principal
    const activeMembers = statusCounts.active;
    const scheduledMembers = statusCounts.scheduled;
    const inactiveMembers = statusCounts.inactive;
    const pendingMembers = statusCounts.pending;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newMembersThisMonth =
      students.filter((s: FitCenterUserProfile) => {
        if (!s.membership?.startDate) return false;
        // Parsear fecha de forma segura
        const [year, month] = s.membership.startDate.split("-");
        return (
          Number.parseInt(month) - 1 === currentMonth &&
          Number.parseInt(year) === currentYear
        );
      }).length || 0;

    return {
      totalMembers,
      activeMembers,
      scheduledMembers,
      inactiveMembers,
      pendingMembers,
      newMembersThisMonth,
    };
  }, [users]);

  const {
    totalMembers,
    activeMembers,
    scheduledMembers,
    inactiveMembers,
    pendingMembers,
    newMembersThisMonth,
  } = stats;

  // Calcular ingresos del mes en curso real
  const revenueMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = users
      .filter((s: FitCenterUserProfile) => {
        if (s.membership?.status !== "active") return false;
        
        // Verificar si la fecha de pago (currentPeriodStart o startDate) es del mes actual
        const paymentDateStr = s.membership.currentPeriodStart || s.membership.startDate;
        if (!paymentDateStr) return false;
        
        const paymentDate = new Date(paymentDateStr);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum: number, student: FitCenterUserProfile) => {
        return sum + (student.membership?.monthlyPrice || 0);
      }, 0);

    return {
      monthlyRevenue,
    };
  }, [users]);

  const { monthlyRevenue } = revenueMetrics;

  // Calcular egresos del mes actual
  const now = new Date();
  const egresosMes = egresos.filter((e) => {
    const d = new Date(e.fecha);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  });
  const totalEgresosMes = egresosMes.reduce((sum, e) => sum + e.monto, 0);

  // Tasa de retención (miembros activos vs total)
  const retentionRate =
    totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : "0";

  // Alumnos próximos a vencer (Top 10 activos con fecha más cercana)
  const upcomingExpirations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return users
      .filter((u) => {
        return getPlanStatus(u) === "active" && u.membership?.currentPeriodEnd;
      })
      .sort((a, b) => {
        return (
          new Date(a.membership!.currentPeriodEnd).getTime() -
          new Date(b.membership!.currentPeriodEnd).getTime()
        );
      })
      .slice(0, 10);
  }, [users]);

  // Alumnos recientemente inactivos (Top 10 vencidos/inactivos, de más reciente a más antiguo)
  const recentlyInactive = useMemo(() => {
    return users
      .filter((u) => {
        return getPlanStatus(u) === "inactive" && u.membership?.currentPeriodEnd;
      })
      .sort((a, b) => {
        return (
          new Date(b.membership!.currentPeriodEnd).getTime() -
          new Date(a.membership!.currentPeriodEnd).getTime()
        );
      })
      .slice(0, 10);
  }, [users]);

  // Componente de métrica con loader
  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    isLoading = false,
    linkTo,
  }: {
    title: string;
    value: string | number;
    subtitle: React.ReactNode;
    icon: any;
    isLoading?: boolean;
    linkTo?: string;
  }) => {
    const CardComponent = (
      <Card
        className={cn(
          "rounded-xl",
          linkTo ? "cursor-pointer hover:shadow-md transition-shadow" : ""
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16 mb-1 rounded-xl" />
              <Skeleton className="h-3 w-24 rounded-xl" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
              {linkTo && (
                <p className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                  Ver detalles →
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );

    return linkTo ? <Link href={linkTo}>{CardComponent}</Link> : CardComponent;
  };

  return (
    <div className="space-y-6 mb-16">
      {/* Estadísticas Principales */}
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Miembros"
          value={totalMembers}
          subtitle={
            <>
              {activeMembers + scheduledMembers} vigentes (
              {totalMembers > 0
                ? (((activeMembers + scheduledMembers) / totalMembers) * 100).toFixed(1)
                : 0}
              % retención)
              <br />
              {newMembersThisMonth} nuevos miembros este mes.
            </>
          }
          icon={Users}
          isLoading={isLoading}
        />

        <MetricCard
          title="Balance"
          value={`$${monthlyRevenue.toLocaleString()}`}
          subtitle={
            <>
              Ganancia del mes
              <br />
              Egresos Mensuales ${totalEgresosMes.toLocaleString()}
            </>
          }
          icon={DollarSign}
          isLoading={isLoading}
          linkTo="/admin/finanzas"
        />

        <MetricCard
          title="Acción Requerida"
          value={pendingMembers}
          subtitle="Pendientes de validación"
          icon={AlertTriangle}
          isLoading={isLoading}
          linkTo="/admin/alumnos?status=pending"
        />
      </div>

      {/* Breakdown por Estados */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Estados de Membresía</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span>Activos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{activeMembers}</span>
                <Badge variant="outline" className="rounded-xl">
                  {totalMembers > 0
                    ? Math.round((activeMembers / totalMembers) * 100)
                    : 0}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0}
              className="h-2 rounded-xl"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span>Programados</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{scheduledMembers}</span>
                <Badge variant="outline" className="rounded-xl">
                  {totalMembers > 0
                    ? Math.round((scheduledMembers / totalMembers) * 100)
                    : 0}
                  %
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                <span>Pendientes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{pendingMembers}</span>
                <Badge variant="outline" className="rounded-xl">
                  {totalMembers > 0
                    ? Math.round((pendingMembers / totalMembers) * 100)
                    : 0}
                  %
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
                <span>Inactivos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{inactiveMembers}</span>
                <Badge variant="outline" className="rounded-xl">
                  {totalMembers > 0
                    ? Math.round((inactiveMembers / totalMembers) * 100)
                    : 0}
                  %
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listas Rápidas: Próximos a Vencer y Recientemente Inactivos */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="rounded-xl">
          <CardHeader className="pb-3 border-b mb-3">
            <CardTitle className="text-base">Próximos a vencer</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ) : upcomingExpirations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay alumnos próximos a vencer.</p>
            ) : (
              <div className="space-y-3">
                {upcomingExpirations.map((u: FitCenterUserProfile) => (
                  <div key={u.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{u.firstName} {u.lastName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{u.membership?.membershipType}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-semibold">{new Date(u.membership!.currentPeriodEnd).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</span>
                      <Link href={`/admin/alumnos/${u.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">Ver Perfil</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-3 border-b mb-3">
            <CardTitle className="text-base text-red-600">Recientemente inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ) : recentlyInactive.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay alumnos inactivos recientemente.</p>
            ) : (
              <div className="space-y-3">
                {recentlyInactive.map((u: FitCenterUserProfile) => (
                  <div key={u.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{u.firstName} {u.lastName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{u.membership?.membershipType}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-red-600 font-medium">{new Date(u.membership!.currentPeriodEnd).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</span>
                      <Link href={`/admin/alumnos/${u.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">Ver Perfil</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
