"use client";

import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePendingRenewals,
  useApproveRenewal,
  useRejectRenewal,
} from "@/lib/react-query/hooks/useRenewals";
import { useClasses } from "@/lib/react-query/hooks/useClasses";
import {
  XCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
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

// --- Sub-componente de cancelaciones (carga lazy) ---
function CancelledClassesTab() {
  const today = new Date().toISOString().split("T")[0];
  const { data: allCancelledClasses = [], isLoading } = useClasses({
    startDate: today,
    status: "cancelled",
    limit: 50,
  });

  const cancelledClasses = allCancelledClasses
    .filter((cls: any) => {
      const classDate = new Date(cls.dateTime);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return classDate.getTime() >= startOfToday.getTime();
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="space-y-3 mt-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (cancelledClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">
          Sin clases canceladas desde hoy.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {cancelledClasses.map((cls: any) => (
        <div
          key={cls.id}
          className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/60"
        >
          <div className="flex items-center gap-3">
            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="font-semibold text-sm text-red-900">{cls.name}</p>
          </div>
          <p className="text-xs text-red-600 shrink-0">
            {format(new Date(cls.dateTime), "EEE dd MMM, HH:mm", {
              locale: es,
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

// --- Componente principal ---
export function Notifications({ hideHeader = false }: { hideHeader?: boolean }) {
  const [mounted, setMounted] = useState(false);

  const [selectedRenewal, setSelectedRenewal] = useState<RenewalItem | null>(
    null
  );
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");

  const { data: pendingRenewals = [], isLoading: renewalsLoading } =
    usePendingRenewals();
  const approveRenewal = useApproveRenewal();
  const rejectRenewal = useRejectRenewal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const urgentCount = pendingRenewals.filter(
    (r: RenewalItem) => (r.user.daysUntilExpiration ?? Infinity) <= 7
  ).length;

  // Aprobar renovación
  const handleApproveRenewal = async (renewal: RenewalItem) => {
    try {
      const startDate =
        customStartDate ||
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Santiago",
        }).format(new Date());

      await approveRenewal.mutateAsync({ userId: renewal.user.id, startDate });
      setShowRenewalModal(false);
      setSelectedRenewal(null);
    } catch (error) {
      console.error("Error al aprobar la renovación:", error);
      alert(
        "Error al aprobar la renovación: " +
        (error instanceof Error ? error.message : String(error))
      );
    }
  };

  // Rechazar renovación
  const handleRejectRenewal = async (renewal: RenewalItem) => {
    try {
      await rejectRenewal.mutateAsync({
        userId: renewal.user.id,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setRejectReason("");
      setShowRenewalModal(false);
      setSelectedRenewal(null);
    } catch (error) {
      console.error("Error al rechazar la renovación:", error);
      alert(
        "Error al rechazar: " +
        (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Renovaciones pendientes y clases canceladas
            </p>
          </div>
          {pendingRenewals.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
              <RefreshCw className="h-3 w-3" />
              {pendingRenewals.length} pendiente{pendingRenewals.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}



      {/* Contenido: Renovaciones pendientes */}
      <div className="space-y-4">
        {/* {urgentCount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              <span className="font-semibold">{urgentCount}</span>{" "}
              {urgentCount === 1
                ? "membresía vence"
                : "membresías vencen"}{" "}
              en los próximos 7 días.
            </span>
          </div>
        )} */}

        {renewalsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : pendingRenewals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRenewals.map((r: RenewalItem) => {
              const isUrgent =
                (r.user.daysUntilExpiration ?? Infinity) <= 7;
              return (
                <Card
                  key={r.id}
                  className={`border-l-4 hover:shadow-md transition-shadow rounded-xl cursor-pointer ${isUrgent ? "border-l-red-500" : "border-l-orange-400"
                    }`}
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
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-base leading-tight">
                          {r.user.firstName} {r.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.user.email}
                        </p>
                      </div>
                      {isUrgent && (
                        <Badge
                          variant="destructive"
                          className="rounded-full text-[10px] shrink-0"
                        >
                          Urgente
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Solicita</span>
                      <span className="font-semibold text-orange-700">
                        {r.requestedPlan?.name ?? "Plan desconocido"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estado</span>
                      <span
                        className={`text-xs font-medium ${r.user.daysUntilExpiration === null
                          ? "text-zinc-500"
                          : r.user.daysUntilExpiration < 0
                            ? "text-red-600"
                            : isUrgent
                              ? "text-amber-600"
                              : "text-zinc-700"
                          }`}
                      >
                        {r.user.daysUntilExpiration === null
                          ? "Sin plan activo"
                          : r.user.daysUntilExpiration < 0
                            ? "Plan vencido"
                            : `Vence en ${r.user.daysUntilExpiration}d`}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-orange-600 hover:bg-orange-700 rounded-xl mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
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
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-400 mb-3" />
            <p className="font-medium text-zinc-700">Todo al día</p>
            <p className="text-sm text-muted-foreground mt-1">
              No hay renovaciones pendientes.
            </p>
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
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Alumno
                  </Label>
                  <p className="font-bold mt-1">
                    {selectedRenewal.user.firstName}{" "}
                    {selectedRenewal.user.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {selectedRenewal.user.email}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Label className="text-[10px] uppercase font-bold text-orange-600">
                    Plan Solicitado
                  </Label>
                  <p className="font-bold text-orange-700 mt-1">
                    {selectedRenewal.requestedPlan?.name ?? "—"}
                  </p>
                  {selectedRenewal.requestedPlan?.price && (
                    <p className="text-sm text-orange-600">
                      $
                      {selectedRenewal.requestedPlan.price.toLocaleString(
                        "es-CL"
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">
                  Fecha de Inicio del Nuevo Período
                </Label>
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
                  disabled={approveRenewal.isPending}
                  onClick={() => handleApproveRenewal(selectedRenewal)}
                >
                  {approveRenewal.isPending
                    ? "Procesando..."
                    : "Confirmar Pago y Activar"}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 rounded-xl"
                  disabled={approveRenewal.isPending}
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
                disabled={rejectRenewal.isPending}
                onClick={() =>
                  selectedRenewal && handleRejectRenewal(selectedRenewal)
                }
              >
                {rejectRenewal.isPending
                  ? "Procesando..."
                  : "Confirmar Rechazo"}
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
