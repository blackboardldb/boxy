"use client";

import { useState } from "react";
import { RefreshCw, Bell, BellRing } from "lucide-react";
import { Notifications } from "../../../components/admincomponents/notifications";
import { InAppAlertsCreator } from "../../../components/admincomponents/in-app-alerts-creator";
import { PublishedAlertsList } from "../../../components/admincomponents/published-alerts-list";
import { usePendingRenewals } from "@/lib/react-query/hooks/useRenewals";
import { useAlerts } from "@/lib/react-query/hooks/useAlerts";

type Tab = "solicitudes" | "inapp" | "notificaciones";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
  },
  {
    id: "inapp",
    label: "Alertas In-App",
    icon: <Bell className="h-3.5 w-3.5" />,
  },
  {
    id: "notificaciones",
    label: "Notificaciones",
    icon: <BellRing className="h-3.5 w-3.5" />,
  },
];

export default function AlertasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("solicitudes");

  // Badges de conteo (cargados solo una vez, React Query cachea)
  const { data: pendingRenewals = [] } = usePendingRenewals();
  const { data: publishedAlerts = [] } = useAlerts();

  const badgeFor = (tab: Tab) => {
    if (tab === "solicitudes" && pendingRenewals.length > 0)
      return pendingRenewals.length;
    if (tab === "notificaciones" && publishedAlerts.length > 0)
      return publishedAlerts.length;
    return null;
  };

  return (
    <div className="p-4 pt-8 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Solicitudes de renovación, alertas In-App y notificaciones
          </p>
        </div>
        {pendingRenewals.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
            <RefreshCw className="h-3 w-3" />
            {pendingRenewals.length} pendiente
            {pendingRenewals.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {tabs.map((tab) => {
          const count = badgeFor(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {count !== null && (
                <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido por tab */}

      {/* Tab 1: Solicitudes de renovación — Notifications sin su header propio
          ya que esta página ya tiene su propio h1. */}
      {activeTab === "solicitudes" && <Notifications hideHeader />}


      {/* Tab 2: Crear alertas In-App */}
      {activeTab === "inapp" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Nueva alerta In-App
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Las alertas aparecerán en el banner de la app para los alumnos
              durante el período definido.
            </p>
          </div>
          <InAppAlertsCreator />
        </div>
      )}

      {/* Tab 3: Notificaciones — historial de alertas publicadas + clases canceladas */}
      {activeTab === "notificaciones" && <PublishedAlertsList />}
    </div>
  );
}
