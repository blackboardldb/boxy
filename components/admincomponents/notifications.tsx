"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  XCircle,
  Bell,
  RefreshCw,
  Filter,
} from "lucide-react";

// HAL-01 Fase 4: Notifications lee desde la tabla MembershipRenewal (API relacional).
// Ya no depende de users[].membership.pendingRenewal del JSONB.

type RenewalItem = {
  id: string;
  status: string;
  requestedAt: string;
  paymentMethod: string | null;
  notes: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    membership: {
      status: string;
      membershipType: string | null;
      currentPeriodEnd: string | null;
    } | null;
    daysUntilExpiration: number | null;
  };
  requestedPlan: {
    id: string | null;
    name: string | null;
    price: number | null;
    classLimit: number | null;
    durationInMonths: number;
  };
};

export function Notifications() {
  const { classSessions, fetchClassSessions } = useBlackSheepStore();

  const [mounted, setMounted] = useState(false);
  const [pendingRenewals, setPendingRenewals] = useState<RenewalItem[]>([]);
  const [renewalsLoading, setRenewalsLoading] = useState(true);
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalItem | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [notificationFilter, setNotificationFilter] = useState("todos");
  const [actionLoading, setActionLoading] = useState(false);

  // Función para cargar renovaciones desde la tabla relacional
  const fetchPendingRenewals = async () => {
    setRenewalsLoading(true);
    try {
      const res = await fetch("/api/admin/renewals?status=pending");
      if (!res.ok) throw new Error("Error al cargar renovaciones");
      const data = await res.json();
      setPendingRenewals(data.data ?? []);
    } catch (err) {
      console.error("[Notifications] Error cargando renovaciones:", err);
      setPendingRenewals([]);
    } finally {
      setRenewalsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPendingRenewals();

    // Clases canceladas de hoy en adelante
    const today = new Date().toISOString().split("T")[0];
    fetchClassSessions(today, undefined, 1, 50, { status: "cancelled" });
  }, []);

  if (!mounted) return null;

  // Clases canceladas (hoy en adelante)
  const cancelledClasses = (classSessions || [])
    .filter((cls: any) => {
      if (cls.status !== "cancelled") return false;
      const classDate = new Date(cls.dateTime);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return classDate.getTime() >= startOfToday.getTime();
    })
    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  // Aprobar renovación: llama al route de approve que actualiza UserMembership + MembershipRenewal
  const handleApproveRenewal = async (renewal: RenewalItem) => {
    setActionLoading(true);
    try {
      const startDate = customStartDate || new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago",
      }).format(new Date());

      const res = await fetch(`/api/users/${renewal.user.id}/renewal/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Error al aprobar la renovación");
      }

      setShowRenewalModal(false);
      setSelectedRenewal(null);
      // Refrescar la lista de pendientes
      await fetchPendingRenewals();
    } catch (error) {
      console.error("Error al aprobar la renovación:", error);
      alert("Error al aprobar la renovación: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setActionLoading(false);
    }
  };

  // Rechazar renovación: llama al route de reject que actualiza MembershipRenewal
  const handleRejectRenewal = async (renewal: RenewalItem) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/users/${renewal.user.id}/renewal/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Error al rechazar la renovación");
      }

      setShowRejectModal(false);
      setRejectReason("");
      setShowRenewalModal(false);
      setSelectedRenewal(null);
      // Refrescar la lista de pendientes
      await fetchPendingRenewals();
    } catch (error) {
      console.error("Error al rechazar la renovación:", error);
      alert("Error al rechazar: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex items-center justify-end gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={notificationFilter} onValueChange={setNotificationFilter}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Mostrar Todo</SelectItem>
            <SelectItem value="renovaciones">Solo Renovaciones</SelectItem>
            <SelectItem value="cancelaciones">Solo Cancelaciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Renovaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 flex items-center gap-2">
              {renewalsLoading ? "—" : pendingRenewals.length}
              <RefreshCw className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingRenewals.filter((r) => (r.user.daysUntilExpiration ?? Infinity) <= 7).length} expiran pronto
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
              {cancelledClasses.length} <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground">Clases hoy / futuro</p>
          </CardContent>
        </Card>
      </div>

      {/* Secciones de Notificaciones */}
      <div className="space-y-8">

        {/* 1. RENOVACIONES */}
        {(notificationFilter === "todos" || notificationFilter === "renovaciones") && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" /> Renovaciones de Plan
            </h2>

            {renewalsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-40 animate-pulse bg-zinc-50 rounded-xl" />
                ))}
              </div>
            ) : pendingRenewals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRenewals.map((r) => (
                  <Card
                    key={r.id}
                    className="border-l-4 border-orange-500 hover:shadow-md transition-shadow rounded-xl"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 rounded-xl"
                        >
                          RENOVACIÓN
                        </Badge>
                        {(r.user.daysUntilExpiration ?? Infinity) <= 7 && (
                          <Badge variant="destructive" className="rounded-xl">
                            URGENTE
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-lg">
                        {r.user.firstName} {r.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        Solicita: <span className="font-medium text-zinc-800">{r.requestedPlan?.name ?? "Plan desconocido"}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {r.user.daysUntilExpiration === null
                          ? "Sin plan activo"
                          : r.user.daysUntilExpiration < 0
                          ? "Plan vencido"
                          : `Plan vence en ${r.user.daysUntilExpiration} días`}
                      </p>
                      <Button
                        size="sm"
                        className="w-full bg-orange-600 hover:bg-orange-700 rounded-xl"
                        onClick={() => {
                          setSelectedRenewal(r);
                          setCustomStartDate(
                            new Intl.DateTimeFormat("en-CA", {
                              timeZone: "America/Santiago",
                            }).format(new Date())
                          );
                          setShowRenewalModal(true);
                        }}
                      >
                        Gestionar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50 rounded-xl border border-dashed text-muted-foreground">
                No hay renovaciones pendientes.
              </div>
            )}
          </div>
        )}

        {/* 2. CANCELACIONES */}
        {(notificationFilter === "todos" || notificationFilter === "cancelaciones") && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" /> Clases Canceladas
            </h2>

            <div className="bg-red-50 p-4 rounded-xl">
              {cancelledClasses.length > 0 ? (
                <div className="space-y-4">
                  {cancelledClasses.map((cls: any) => (
                    <div key={cls.id}>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-red-900">{cls.name}</p>
                        <p className="text-sm text-red-700">
                          {format(new Date(cls.dateTime), "EEE dd MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-zinc-50 rounded-xl border border-dashed text-muted-foreground">
                  No hay clases canceladas recientemente.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Gestionar Renovación */}
      <Dialog open={showRenewalModal} onOpenChange={setShowRenewalModal}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle>Gestionar Renovación</DialogTitle>
          </DialogHeader>
          {selectedRenewal && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-xl border">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Alumno</Label>
                  <p className="font-bold">
                    {selectedRenewal.user.firstName} {selectedRenewal.user.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">{selectedRenewal.user.email}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Label className="text-[10px] uppercase font-bold text-orange-600">Plan Solicitado</Label>
                  <p className="font-bold text-orange-700">
                    {selectedRenewal.requestedPlan?.name ?? "—"}
                  </p>
                  {selectedRenewal.requestedPlan?.price && (
                    <p className="text-sm text-orange-600">
                      ${selectedRenewal.requestedPlan.price.toLocaleString("es-CL")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Fecha de Inicio del Nuevo Período</Label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-xl"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                  disabled={actionLoading}
                  onClick={() => handleApproveRenewal(selectedRenewal)}
                >
                  {actionLoading ? "Procesando..." : "Confirmar Pago y Activar"}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl"
                  disabled={actionLoading}
                  onClick={() => setShowRejectModal(true)}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Rechazo */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Confirmar Rechazo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Label>Motivo del rechazo</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: No se confirma transferencia..."
              className="rounded-xl"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                disabled={actionLoading}
                onClick={() => selectedRenewal && handleRejectRenewal(selectedRenewal)}
              >
                {actionLoading ? "Procesando..." : "Confirmar Rechazo"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowRejectModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
