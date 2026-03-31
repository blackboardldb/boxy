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
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  scheduledMembers: number;
  pendingMembers: number;
  inactiveMembers: number;
  newThisMonth: number;
  retentionRate: number;
  monthlyRevenue: number;
}

interface MemberListItem {
  id: string;
  firstName: string;
  lastName: string;
  membershipType: string | null;
  currentPeriodEnd: string | null;
}

export function AdminDashboard() {
  const { egresos = [], fetchEgresos } = useBlackSheepStore();

  const [statsLoading, setStatsLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    scheduledMembers: 0,
    pendingMembers: 0,
    inactiveMembers: 0,
    newThisMonth: 0,
    retentionRate: 0,
    monthlyRevenue: 0,
  });
  const [expiringData, setExpiringData] = useState<MemberListItem[]>([]);
  const [expiredData, setExpiredData] = useState<MemberListItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userRole = (user?.app_metadata?.role as string) || (user?.user_metadata?.role as string);
        setRole(userRole);

        // Métricas: rápido, independiente
        const statsPromise = fetch("/api/admin/stats")
          .then((r) => r.json())
          .then((data) => { if (data.success) setDashboardStats(data.data); })
          .catch((e) => console.error("[AdminDashboard] stats fetch failed:", e))
          .finally(() => setStatsLoading(false));

        // Listas: 3 fetches en paralelo, todos limitados en el backend
        const listsPromise = (async () => {
          try {
            const requests: Promise<any>[] = [
              fetch("/api/admin/members/expiring?take=10").then((r) => r.json()),
              fetch("/api/admin/members/expired?take=10").then((r) => r.json()),
            ];
            if (userRole === "admin") requests.push(fetchEgresos() as any);

            const [expiring, expired] = await Promise.all(requests);
            if (expiring?.success) setExpiringData(expiring.data);
            if (expired?.success) setExpiredData(expired.data);
          } catch (error) {
            console.error("[AdminDashboard] lists fetch failed:", error);
          } finally {
            setListsLoading(false);
          }
        })();

        await Promise.all([statsPromise, listsPromise]);
      } catch (error) {
        console.error("[AdminDashboard] Error loading dashboard:", error);
        setStatsLoading(false);
        setListsLoading(false);
      }
    };

    loadData();
  }, [fetchEgresos]);

  // Métricas vienen del endpoint /api/admin/stats — ya calculadas en el servidor
  const {
    totalMembers,
    activeMembers,
    scheduledMembers,
    pendingMembers,
    inactiveMembers,
    newThisMonth: newMembersThisMonth,
    retentionRate,
    monthlyRevenue,
  } = dashboardStats;

  // Egresos del mes actual (se mantiene el cálculo local porque depende de fetchEgresos)
  const now = new Date();
  const egresosMes = egresos.filter((e) => {
    const d = new Date(e.fecha);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  });
  const totalEgresosMes = egresosMes.reduce((sum, e) => sum + e.monto, 0);

  // Listas vienen directo del estado local — ya filtradas, ordenadas y limitadas en el backend
  const upcomingExpirations = expiringData;
  const recentlyInactive = expiredData;

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
          isLoading={statsLoading}
          linkTo="/admin/alumnos"
        />

        {role === "admin" && (
          <MetricCard
            title="Balance"
            value={`$${(monthlyRevenue - totalEgresosMes).toLocaleString()}`}
            subtitle={
              <>
                Ganancia del mes ${monthlyRevenue.toLocaleString()}
                <br />
                Egresos Mensuales ${totalEgresosMes.toLocaleString()}
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
            {listsLoading ? (
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
                       <span className="text-xs font-semibold ml-2">{u.currentPeriodEnd ? new Date(u.currentPeriodEnd).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—'}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Link href={`/admin/alumnos/${u.id}`} className="text-xs underline font-bold  transition-colors p-2 rounded-xl hover:bg-zinc-100">Ver Perfil</Link>
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
            {listsLoading ? (
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
                        <span className="text-xs text-red-600 font-medium ml-2">{u.currentPeriodEnd ? new Date(u.currentPeriodEnd).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—'}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Link href={`/admin/alumnos/${u.id}`} className="text-xs underline font-bold  transition-colors p-2 rounded-xl hover:bg-zinc-100">Ver Perfil</Link>
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
