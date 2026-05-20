"use client";

import {
  Bell,
  Trash2,
  Megaphone,
  XOctagon,
  AlertTriangle,
  Info,
  Loader2,
  XCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAlerts, useDeleteAlert } from "@/lib/react-query/hooks/useAlerts";
import { useClasses } from "@/lib/react-query/hooks/useClasses";

interface InAppAlert {
  id: string;
  title: string;
  content: string;
  type: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// ─── Helpers de presentación ────────────────────────────────────────────────

function getAlertIcon(type: string) {
  switch (type) {
    case "noticia":
      return <Megaphone className="w-4 h-4" />;
    case "cancelacion":
      return <XOctagon className="w-4 h-4" />;
    case "advertencia":
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
}

function getAlertColor(type: string) {
  switch (type) {
    case "noticia":
      return "bg-[#2286f1]";
    case "cancelacion":
      return "bg-[#e54343]";
    case "advertencia":
      return "bg-[#e77a20]";
    default:
      return "bg-gray-500";
  }
}

function getAlertLabel(type: string) {
  switch (type) {
    case "noticia":
      return "Noticia";
    case "cancelacion":
      return "Cancelación";
    case "advertencia":
      return "Advertencia";
    default:
      return type;
  }
}

// ─── Sub-componente: Clases Canceladas ──────────────────────────────────────

function CancelledClassesSection() {
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (cancelledClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Calendar className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">
          Sin clases canceladas desde hoy.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
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

// ─── Componente principal ────────────────────────────────────────────────────

/**
 * Lista de alertas In-App publicadas/programadas + sección de clases canceladas.
 * Extraído de AlertsManager para usarse de forma independiente en el Tab 3 de /alertas.
 */
export function PublishedAlertsList() {
  const { data: alerts = [], isLoading } = useAlerts();
  const deleteAlert = useDeleteAlert();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta alerta?")) return;
    try {
      await deleteAlert.mutateAsync(id);
    } catch (error) {
      console.error("Error al eliminar alerta:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Sección: Alertas publicadas y programadas ── */}
      <div>
        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-3">
          Alertas publicadas y programadas
        </h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs font-medium">Cargando alertas...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-zinc-400">
            <Bell className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-medium italic">
              No hay alertas registradas
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 overflow-hidden bg-white">
            {alerts.map((alert: InAppAlert) => (
              <div
                key={alert.id}
                className="p-4 transition-colors hover:bg-zinc-50/50 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 p-2 rounded-xl text-white shrink-0 ${getAlertColor(alert.type)}`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {getAlertLabel(alert.type)}
                      </span>
                      <span className="text-[10px] text-zinc-300">•</span>
                      <span className="text-[10px] font-medium text-zinc-400">
                        {format(new Date(alert.startDate), "dd/MM/yy")} -{" "}
                        {format(new Date(alert.endDate), "dd/MM/yy")}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                      {alert.content}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-red-500 transition-colors h-8 w-8 shrink-0"
                  onClick={() => handleDelete(alert.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sección: Clases canceladas ── */}
      <div>
        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-3">
          Clases canceladas (desde hoy)
        </h3>
        <CancelledClassesSection />
      </div>
    </div>
  );
}
