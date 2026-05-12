"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WhatsAppLink } from "../WhatsAppLink";
import { parseISO } from "date-fns";
import { useAdminStats, useExpiringMembers, useExpiredMembers } from "@/lib/react-query/hooks/useAdminStats";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  scheduledMembers: number;
  pendingMembers: number;
  inactiveMembers: number;
  newThisMonth: number;
  retentionRate: number;
  monthlyRevenue: number;  // Ingresos reales: SUM(membership_renewals.amount) aprobados este mes
  monthlyEgresos: number;  // Egresos: SUM(expenses.monto) del mes
  monthlyBalance: number;  // monthlyRevenue - monthlyEgresos
}

interface MemberListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  membershipType: string | null;
  currentPeriodEnd: string | null;
}

export function AdminDashboard({ role }: { role: string }) {
  const [expiringSkip, setExpiringSkip] = useState(0);
  const [expiredSkip, setExpiredSkip] = useState(0);

  const { data: dashboardStats, isLoading: statsLoading } = useAdminStats();
  const { data: expiringDataResponse, isLoading: expiringLoading } = useExpiringMembers(5, expiringSkip);
  const { data: expiredDataResponse, isLoading: expiredLoading } = useExpiredMembers(5, expiredSkip);

  // Use state to accumulate the lists for "load more" functionality
  const [accumulatedExpiring, setAccumulatedExpiring] = useState<MemberListItem[]>([]);
  const [accumulatedExpired, setAccumulatedExpired] = useState<MemberListItem[]>([]);

  useEffect(() => {
    if (expiringDataResponse) {
      setAccumulatedExpiring(prev => {
        const combined = [...prev, ...expiringDataResponse];
        const uniqueMap = new Map(combined.map((item) => [item.id, item]));
        return Array.from(uniqueMap.values());
      });
    }
  }, [expiringDataResponse]);

  useEffect(() => {
    if (expiredDataResponse) {
      setAccumulatedExpired(prev => {
        const combined = [...prev, ...expiredDataResponse];
        const uniqueMap = new Map(combined.map((item) => [item.id, item]));
        return Array.from(uniqueMap.values());
      });
    }
  }, [expiredDataResponse]);

  const upcomingExpirations = accumulatedExpiring;
  const recentlyInactive = accumulatedExpired;

  const hasMoreExpiring = expiringDataResponse?.length === 5 && upcomingExpirations.length < 15;
  const hasMoreExpired = expiredDataResponse?.length === 5 && recentlyInactive.length < 15;

  const loadMoreExpiring = () => {
    if (!hasMoreExpiring) return;
    setExpiringSkip(upcomingExpirations.length);
  };

  const loadMoreExpired = () => {
    if (!hasMoreExpired) return;
    setExpiredSkip(recentlyInactive.length);
  };

  // Egresos y balance vienen ahora desde el API (fuente unificada con Finanzas)
  const {
    totalMembers = 0,
    activeMembers = 0,
    scheduledMembers = 0,
    pendingMembers = 0,
    inactiveMembers = 0,
    newThisMonth: newMembersThisMonth = 0,
    retentionRate = 0,
    monthlyRevenue = 0,
    monthlyEgresos = 0,
    monthlyBalance = 0,
  } = dashboardStats || {};

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
    return (
      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          {linkTo && (
            <Link
              href={linkTo}
              className="text-sm underline font-bold text-zinc-900 px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors"
            >
              Ver detalle
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16 mb-1 rounded-xl" />
              <Skeleton className="h-3 w-24 rounded-xl" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-zinc-900">{value}</div>
                <Icon className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 mb-16">
      {/* Estadísticas Principales */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total alumnos"
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
          isLoading={statsLoading}
          linkTo="/admin/alumnos"
        />

        {role === "admin" && (
          <MetricCard
            title="Balance del Mes"
            value={`$${monthlyBalance.toLocaleString()}`}
            subtitle={
              <>
                Ingresos reales ${monthlyRevenue.toLocaleString()}
                <br />
                Egresos ${monthlyEgresos.toLocaleString()}
              </>
            }
            icon={DollarSign}
            isLoading={statsLoading}
            linkTo="/admin/finanzas"
          />
        )}

        <MetricCard
          title="Acción Requerida"
          value={pendingMembers}
          subtitle="Pendientes de validación"
          icon={AlertTriangle}
          isLoading={statsLoading}
          linkTo="/admin/alertas"
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
            {expiringLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ) : upcomingExpirations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay alumnos próximos a vencer.</p>
            ) : (
              <div className="space-y-3">
                {upcomingExpirations.map((u) => (
                  <div key={u.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0 last:pb-0">
                    <div className="">
                      <p className="font-medium">{u.firstName} {u.lastName}</p>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{u.membershipType}</span>
                       <span className="text-xs font-semibold ml-2">{u.currentPeriodEnd ? parseISO(u.currentPeriodEnd.substring(0, 10)).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <WhatsAppLink phone={u.phone} className="p-2 rounded-xl hover:bg-zinc-100" />
                      <Link href={`/admin/alumnos/${u.id}`} className="text-xs underline font-bold transition-colors p-2 rounded-xl hover:bg-zinc-100">
                        Ver Perfil
                      </Link>
                    </div>
                  </div>
                ))}
                
                {hasMoreExpiring && (
                  <button
                    onClick={loadMoreExpiring}
                    disabled={expiringLoading}
                    className="w-full text-center py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-xl mt-2 disabled:opacity-50"
                  >
                    {expiringLoading ? "Cargando..." : "Ver más"}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-3 border-b mb-3">
            <CardTitle className="text-base text-red-600">Recientemente inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            {expiredLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ) : recentlyInactive.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay alumnos inactivos recientemente.</p>
            ) : (
              <div className="space-y-3">
                {recentlyInactive.map((u) => (
                  <div key={u.id} className="flex justify-between items-center text-sm pb-2 border-b last:border-0 last:pb-0">
                    <div className="">
                      <p className="font-medium">{u.firstName} {u.lastName}</p>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{u.membershipType}</span>
                        <span className="text-xs text-red-600 font-medium ml-2">{u.currentPeriodEnd ? parseISO(u.currentPeriodEnd.substring(0, 10)).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <WhatsAppLink phone={u.phone} className="p-2 rounded-xl hover:bg-zinc-100" />
                      <Link href={`/admin/alumnos/${u.id}`} className="text-xs underline font-bold transition-colors p-2 rounded-xl hover:bg-zinc-100">
                        Ver Perfil
                      </Link>
                    </div>
                  </div>
                ))}

                {hasMoreExpired && (
                  <button
                    onClick={loadMoreExpired}
                    disabled={expiredLoading}
                    className="w-full text-center py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-xl mt-2 disabled:opacity-50"
                  >
                    {expiredLoading ? "Cargando..." : "Ver más"}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
