"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WhatsAppLink } from "../WhatsAppLink";
import { parseISO } from "date-fns";
import { useAdminStats, useExpiringMembers, useExpiredMembers, useAdminFinanceCompare } from "@/lib/react-query/hooks/useAdminStats";

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
  const { data: financeCompare, isLoading: financeLoading } = useAdminFinanceCompare();

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
              className="text-sm underline font-bold text-zinc-900 p-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
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
              <div className="flex items-center gap-1">
                <Icon className="h-5 w-5 text-zinc-400" />
                <div className="text-2xl font-bold text-zinc-900">{value}</div>
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
      {/* Banner de Acción Requerida — solo visible cuando hay pendientes */}
      {!statsLoading && pendingMembers > 0 && (
        <Link
          href="/admin/alertas"
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 bg-orange-500 border border-orange-600 hover:bg-orange-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 shrink-0">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-100">
                {pendingMembers === 1
                  ? "1 nueva solicitud de renovación pendiente"
                  : `${pendingMembers} solicitudes de renovación pendientes`}
              </p>
              <p className="text-xs text-amber-100">Haz clic para revisar</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-amber-900 shrink-0" />
        </Link>
      )}

      {/* Grilla Principal de Métricas */}
      <div className={`grid gap-4 grid-cols-1 ${role === "admin" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {/* ── Tarjeta 1: Alumnos Vigentes ── */}
        {/* ── Tarjeta 1: Alumnos Vigentes ── */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Alumnos vigentes
            </span>
            <Link
              href="/admin/alumnos"
              className="text-sm underline font-bold text-zinc-900 p-1.5 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {statsLoading ? (
            <div className="space-y-3 mt-4">
              <Skeleton className="h-8 w-16 mb-1 rounded-xl" />
              <Skeleton className="h-3 w-24 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div>
                <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  {activeMembers + scheduledMembers}
                </span>
              </div>

              <div className="border-t border-zinc-100 my-2" />

              <div className="grid grid-cols-2 gap-4">
                {/* Total (Izquierda) */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Registrados</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-zinc-800">
                      {totalMembers}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      ({totalMembers > 0 ? (((activeMembers + scheduledMembers) / totalMembers) * 100).toFixed(1) : 0}% del total)
                    </span>
                  </div>
                </div>

                {/* Nuevos (Derecha) */}
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Nuevos</span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-sm font-bold text-zinc-800">
                      {newMembersThisMonth}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      este mes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tarjeta 2: Estados de Membresía ── */}
        <div className="rounded-xl border bg-card p-4 flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Estados de Membresía</p>
          {statsLoading ? (
            <div className="flex gap-4 items-center flex-1">
              <Skeleton className="h-32 w-32 rounded-full shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-4 w-full rounded-xl" />
              </div>
            </div>
          ) : (() => {
            const segments = [
              { label: "Activos", value: activeMembers, color: "#22c55e" },
              { label: "Programados", value: scheduledMembers, color: "#3b82f6" },
              { label: "Pendientes", value: pendingMembers, color: "#f97316" },
              { label: "Inactivos", value: inactiveMembers, color: "#9ca3af" },
            ];
            const total = segments.reduce((s, x) => s + x.value, 0) || 1;
            const r = 40, cx = 50, cy = 50;
            const circ = 2 * Math.PI * r;
            let offset = 0;
            return (
              <div className="flex gap-4 items-center flex-1">
                {/* Donut SVG — sin librería, sin JS extra */}
                <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90" aria-hidden="true">
                  {segments.map((seg, i) => {
                    const dash = (seg.value / total) * circ;
                    const gap = circ - dash;
                    const el = (
                      <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                      />
                    );
                    offset += dash;
                    return el;
                  })}
                </svg>
                {/* Leyenda */}
                <div className="space-y-1.5 flex-1 text-sm">
                  {segments.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-muted-foreground">{seg.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900">{seg.value}</span>
                        <span className="text-[11px] text-muted-foreground">{Math.round((seg.value / total) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Tarjeta 3: Comparativa Financiera (Carga Diferida) ── */}
        {role === "admin" && (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Este mes vs. mes anterior</p>
            {financeLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : (() => {
              const currentBalance = financeCompare?.currentBalance ?? 0;
              const prevBalance = financeCompare?.prevBalance ?? 0;
              const balancePct = financeCompare?.balancePct ?? null;

              const currentRevenue = financeCompare?.currentRevenue ?? 0;
              const prevRevenue = financeCompare?.prevRevenue ?? 0;
              const revenuePct = financeCompare?.revenuePct ?? null;

              const currentEgresos = financeCompare?.currentEgresos ?? 0;
              const prevEgresos = financeCompare?.prevEgresos ?? 0;
              const egresosPct = financeCompare?.egresosPct ?? null;

              const balanceIsUp = (balancePct ?? 0) > 0;

              const revenueIsUp = (revenuePct ?? 0) > 0;
              const revenueGood = revenueIsUp;
              const revenueArrow = revenuePct === null ? "" : revenueIsUp ? "↑" : "↓";

              const egresosIsUp = (egresosPct ?? 0) > 0;
              const egresosGood = !egresosIsUp; // for expenses, down is good
              const egresosArrow = egresosPct === null ? "" : egresosIsUp ? "↑" : "↓";

              return (
                <div className="space-y-4 pt-1">
                  {/* ── Ingresos (Destacado arriba) ── */}
                  <div>
                    <div className="flex justify-start gap-2 items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      <span>Ingresos</span>
                      {revenuePct !== null && (
                        <span className={`text-xs font-bold ${revenueGood ? "text-emerald-600" : "text-rose-600"}`}>
                          {revenueArrow}{Math.abs(revenuePct)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                        ${currentRevenue.toLocaleString("es-CL")}
                      </span>
                      <span className="text-xs text-zinc-400">
                        vs. ${prevRevenue.toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 my-2" />

                  {/* ── Egresos y Balance (Uno a la izquierda y otro a la derecha, limpio) ── */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Egresos (Izquierda) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                        <span>Egresos</span>
                        {egresosPct !== null && (
                          <span className={`font-bold ${egresosGood ? "text-emerald-600" : "text-rose-500"}`}>
                            {egresosArrow}{Math.abs(egresosPct)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-zinc-800">
                          ${currentEgresos.toLocaleString("es-CL")}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          vs. ${prevEgresos.toLocaleString("es-CL")}
                        </span>
                      </div>
                    </div>

                    {/* Balance (Derecha) */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                        <span>Balance</span>
                        {balancePct !== null && (
                          <span className={`font-bold ${balanceIsUp ? "text-emerald-600" : "text-rose-500"}`}>
                            {balanceIsUp ? "↑" : "↓"}{Math.abs(balancePct)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className={`text-base font-bold ${currentBalance >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                          ${currentBalance.toLocaleString("es-CL")}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          vs. ${prevBalance.toLocaleString("es-CL")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
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
