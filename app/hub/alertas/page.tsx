"use client";

import { useState } from "react";
import { RefreshCw, Bell, BellRing } from "lucide-react";
import { Notifications } from "../../../components/admincomponents/notifications";
import { InAppAlertsCreator } from "../../../components/admincomponents/in-app-alerts-creator";
import { PublishedAlertsList } from "../../../components/admincomponents/published-alerts-list";
import { usePendingRenewals } from "@/lib/react-query/hooks/useRenewals";
import { useAlerts } from "@/lib/react-query/hooks/useAlerts";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

type Tab = "solicitudes" | "notificaciones";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "solicitudes",
    label: "Solicitud renovacion",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
  },
  {
    id: "notificaciones",
    label: "Hist notificaciones",
    icon: <BellRing className="h-3.5 w-3.5" />,
  },
];

export default function AlertasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("solicitudes");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      {/* Header Action */}
      <div className="flex justify-end mb-5">
        <Button onClick={() => setIsDrawerOpen(true)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Nueva alerta
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Solicitudes de renovación, enviar notificaciones y ver notificaciones
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-full">
        {tabs.map((tab) => {
          const count = badgeFor(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex justify-center items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.icon}
              {tab.label}
              {count !== null && (
                <span className=" bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido por tab */}

      {/* Tab 1: Solicitudes de renovación */}
      {activeTab === "solicitudes" && <Notifications hideHeader />}

      {/* Tab 2: Notificaciones — historial de alertas publicadas + clases canceladas */}
      {activeTab === "notificaciones" && <PublishedAlertsList />}

      {/* Drawer para Crear Alertas */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <div className="max-w-xl mx-auto w-full p-4 overflow-y-auto">
            <DrawerHeader className="px-0 pt-0 text-left">
              <DrawerTitle>Nueva notificación In-App</DrawerTitle>
              <DrawerDescription>
                Las alertas aparecerán en el banner de la app para los alumnos durante el período definido.
              </DrawerDescription>
            </DrawerHeader>
            <InAppAlertsCreator onSuccess={() => setIsDrawerOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
