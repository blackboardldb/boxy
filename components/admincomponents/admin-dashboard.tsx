"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
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
  saasPlanName?: "EARLY" | "BASE" | "PRO" | null;
  overrideMaxActiveStudents?: number | null;
}

interface MemberListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  membershipType: string | null;
  currentPeriodEnd: string | null;
}

const WHATSAPP_EXPIRED_MESSAGE = `🗓️ *Tu plan ha finalizado. Recuerda que para seguir entrenando:*

•  Debes renovar tu membresía en el centro.
•  Los pagos y las opciones de planes se gestionan directamente con la administración.

¡Te esperamos de vuelta pronto! 💪`;

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
    saasPlanName,
    overrideMaxActiveStudents,
  } = dashboardStats || {};

  // Calcular Límite
  const PLAN_LIMITS: Record<string, number> = {
    EARLY: 40,
    BASE: 80,
    PRO: 150,
  };
  
  const planLimit = saasPlanName && PLAN_LIMITS[saasPlanName] ? PLAN_LIMITS[saasPlanName] : null;
  const effectiveLimit = overrideMaxActiveStudents ?? planLimit;
  const currentActive = activeMembers + scheduledMembers;
  
  const remainingSpots = effectiveLimit !== null ? (effectiveLimit + 3) - currentActive : null;
  const showCapacityAlert = remainingSpots !== null && remainingSpots <= 3;

  return (
    <div className="space-y-6 mb-16">
      {/* Banner de Acción Requerida — solo visible cuando hay pendientes */}
      {!statsLoading && pendingMembers > 0 && (
        <Link
          href="/hub/alertas"
          prefetch={false}
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

      {/* Alerta de Capacidad */}
      {!statsLoading && showCapacityAlert && (
        <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 bg-red-100 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-red-200" />
                <circle 
                  cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" 
                  strokeDasharray={100.53 /* 2 * PI * 16 */} 
                  strokeDashoffset={100.53 - (100.53 * Math.min(100, (currentActive / (effectiveLimit! + 3)) * 100)) / 100}
                  className="text-red-600 transition-all duration-1000 ease-out" 
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-red-700">{remainingSpots! > 0 ? remainingSpots : 0}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">
                {remainingSpots! <= 0 
                  ? "Capacidad máxima alcanzada" 
                  : `Quedan ${remainingSpots} cupos disponibles`}
              </p>
              <p className="text-xs text-red-800">
                Has alcanzado el límite de tu plan. Contáctanos en configuración para aumentarlo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grilla Principal de Métricas */}
      <div className={`grid gap-2 grid-cols-1 ${role === "admin" ? "md:grid-cols-2 " : "md:grid-cols-2"}`}>
        {/* ── Tarjeta 1: Alumnos Vigentes ── */}
        {/* ── Tarjeta 1: Alumnos Vigentes ── */}
        <div className="space-y-2">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground tracking-wider">
                Alumnos vigentes
              </span>
              <Link
                href="/hub/alumnos"
                prefetch={false}
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
              <div className="">
                <div>
                  <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                    {activeMembers + scheduledMembers}
                  </span>
                </div>



                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-2 mt-2" >
                  {/* Total (Izquierda) */}
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Inscritos</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-zinc-800">
                        {totalMembers}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({totalMembers > 0 ? (((activeMembers + scheduledMembers) / totalMembers) * 100).toFixed(1) : 0}% del total activos)
                      </span>
                    </div>
                  </div>

                  {/* Nuevos (Derecha) */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Nuevos</span>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-sm font-bold text-zinc-800">
                        {newMembersThisMonth}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        este mes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* ── Tarjeta 3: Comparativa Financiera (Carga Diferida) ── */}
          {role === "admin" && (
            <div className="rounded-xl border bg-card p-4">
              {/* <p className="text-xs font-semibold  uppercase tracking-wider mb-4">Este mes vs. mes anterior</p> */}
              {financeLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-8 w-32 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              ) : (() => {
                const currentRevenue = financeCompare?.currentRevenue ?? 0;
                const prevRevenue = financeCompare?.prevRevenue ?? 0;
                const revenuePct = financeCompare?.revenuePct ?? null;

                const revenueIsUp = (revenuePct ?? 0) > 0;
                const revenueGood = revenueIsUp;
                const revenueArrow = revenuePct === null ? "" : revenueIsUp ? "↑" : "↓";

                return (
                  <div>
                    <div className="flex justify-start gap-2 items-center text-sm font-medium text-muted-foreground tracking-wider mb-4">
                      <span className="text-muted-foreground">Ingresos mes</span>

                    </div>
                    <div className="flex-col items-baseline gap-2">
                      <p className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                        ${currentRevenue.toLocaleString("es-CL")}
                      </p>
                      {revenuePct !== null && (
                        <span className={`text-xs font-bold ${revenueGood ? "text-emerald-600" : "text-rose-600"}`}>
                          {revenueArrow}{Math.abs(revenuePct)}% {" "}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        vs. ${prevRevenue.toLocaleString("es-CL")} mes anterior
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )
          }


        </div>
        {/* ── Tarjeta 2: Estados de Membresía ── */}
        <div className="rounded-xl border bg-card p-4 flex flex-col justify-between">
          <p className="text-sm font-medium text-muted-foreground tracking-wider mb-4">Estados de Membresía</p>
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
              { label: "Inactivos", value: inactiveMembers, color: "#e1e2e5ff" },
            ];
            const total = segments.reduce((s, x) => s + x.value, 0) || 1;
            const r = 40, cx = 50, cy = 50;
            const circ = 2 * Math.PI * r;
            let offset = 0;
            return (
              <div className="flex flex-col gap-4 items-center flex-1">
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
                <div className="space-y-1.5 flex-1 text-xs w-full">
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
      </div>

      {/* Listas Rápidas: Próximos a Vencer y Recientemente Inactivos */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="rounded-xl overflow-hidden p-0 py-4">
          <CardHeader className="pt-0 pb-3 border-b px-3 sm:px-6 mb-0">
            <div>
              <span className="text-sm font-medium text-muted-foreground tracking-wider block">Alumnos</span>
              <CardTitle className="text-lg font-bold tracking-tight">Próximos a vencer</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expiringLoading ? (
              <div className="space-y-3 p-3 sm:p-6">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ) : upcomingExpirations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 px-3">No hay alumnos próximos a vencer.</p>
            ) : (
              <div className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b hover:bg-slate-100 bg-slate-100">
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground pl-3 sm:pl-6 pr-1">Alumno</TableHead>
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground px-1">Vence</TableHead>
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground text-right pr-3 sm:pr-6 pl-1">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingExpirations.map((u) => (
                      <TableRow key={u.id} className="hover:bg-zinc-50/50">
                        <TableCell className="py-2.5 pl-3 sm:pl-6 pr-1">
                          <p className="font-medium text-sm text-zinc-900 leading-tight">
                            {u.firstName} {u.lastName}
                          </p>
                          {u.membershipType && (
                            <span className="text-[11px] text-muted-foreground font-normal block truncate max-w-[120px] sm:max-w-none">
                              {u.membershipType}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 px-1 text-xs font-semibold whitespace-nowrap text-zinc-700">
                          {u.currentPeriodEnd
                            ? parseISO(u.currentPeriodEnd.substring(0, 10)).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
                            : '—'}
                        </TableCell>
                        <TableCell className="py-2.5 pr-3 sm:pr-6 pl-1 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <WhatsAppLink phone={u.phone} message={WHATSAPP_EXPIRED_MESSAGE} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors" />
                            <Link href={`/hub/alumnos/${u.id}`} prefetch={false} className="text-xs underline font-bold transition-colors p-1.5 rounded-lg hover:bg-zinc-100 whitespace-nowrap">
                              Ver Perfil
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {hasMoreExpiring && (
                  <div className="px-3 sm:px-6 pt-3 pb-1">
                    <button
                      onClick={loadMoreExpiring}
                      disabled={expiringLoading}
                      className="w-full text-center py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-xl disabled:opacity-50"
                    >
                      {expiringLoading ? "Cargando..." : "Ver más"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl overflow-hidden p-0 py-4">
          <CardHeader className="pt-0 pb-3 border-b px-3 sm:px-6 mb-0">
            <div>
              <span className="text-sm font-medium text-muted-foreground tracking-wider block">Alumnos</span>
              <CardTitle className="text-lg font-bold tracking-tight text-red-600">Recientemente inactivos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expiredLoading ? (
              <div className="space-y-3 p-3 sm:p-6">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ) : recentlyInactive.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 px-3">No hay alumnos inactivos recientemente.</p>
            ) : (
              <div className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b hover:bg-slate-100 bg-slate-100">
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground pl-3 sm:pl-6 pr-1">Alumno</TableHead>
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground px-1">Venció</TableHead>
                      <TableHead className="h-8 text-xs font-semibold text-muted-foreground text-right pr-3 sm:pr-6 pl-1">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentlyInactive.map((u) => (
                      <TableRow key={u.id} className="hover:bg-zinc-50/50">
                        <TableCell className="py-2.5 pl-3 sm:pl-6 pr-1">
                          <p className="font-medium text-sm text-zinc-900 leading-tight">
                            {u.firstName} {u.lastName}
                          </p>
                          {u.membershipType && (
                            <span className="text-[11px] text-muted-foreground font-normal block truncate max-w-[120px] sm:max-w-none">
                              {u.membershipType}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 px-1 text-xs font-semibold whitespace-nowrap text-red-600">
                          {u.currentPeriodEnd
                            ? parseISO(u.currentPeriodEnd.substring(0, 10)).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
                            : '—'}
                        </TableCell>
                        <TableCell className="py-2.5 pr-3 sm:pr-6 pl-1 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <WhatsAppLink phone={u.phone} message={WHATSAPP_EXPIRED_MESSAGE} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors" />
                            <Link href={`/hub/alumnos/${u.id}`} prefetch={false} className="text-xs underline font-bold transition-colors p-1.5 rounded-lg hover:bg-zinc-100 whitespace-nowrap">
                              Ver Perfil
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {hasMoreExpired && (
                  <div className="px-3 sm:px-6 pt-3 pb-1">
                    <button
                      onClick={loadMoreExpired}
                      disabled={expiredLoading}
                      className="w-full text-center py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-50 rounded-xl disabled:opacity-50"
                    >
                      {expiredLoading ? "Cargando..." : "Ver más"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
