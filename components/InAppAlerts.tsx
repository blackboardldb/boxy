"use client";

import { useEffect, useState } from "react";
import { Megaphone, XOctagon, AlertTriangle, Info, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

interface InAppAlert {
  id: string;
  title: string;
  content: string;
  type: string;
}

export function InAppAlerts() {
  const today = new Date().toISOString().split("T")[0];
  const { data: alerts = [] } = useQuery({
    queryKey: ["inAppAlerts", today],
    queryFn: () =>
      fetchClient<{ success: boolean; data: InAppAlert[] }>("/alerts").then(
        (res) => res.data ?? []
      ),
    staleTime: 1000 * 60 * 5, // 5 min — las alertas cambian poco
  });
  const [hiddenAlertIds, setHiddenAlertIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("alert_closed_")) {
          saved.push(key.replace("alert_closed_", ""));
        }
      }
      setHiddenAlertIds(saved);
    }
  }, []);

  const visibleAlerts = (alerts || []).filter(a => !hiddenAlertIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "noticia":
        return {
          bg: "bg-blue-600 dark:bg-blue-500",
          icon: <Megaphone className="w-5 h-5 text-white mr-3 shrink-0" />,
        };
      case "cancelacion":
        return {
          bg: "bg-red-600 dark:bg-red-500",
          icon: <XOctagon className="w-5 h-5 text-white mr-3 shrink-0" />,
        };
      case "advertencia":
        return {
          bg: "bg-orange-600 dark:bg-orange-500",
          icon: <AlertTriangle className="w-5 h-5 text-white mr-3 shrink-0" />,
        };
      default:
        return {
          bg: "bg-zinc-800",
          icon: <Info className="w-5 h-5 text-white mr-3 shrink-0" />,
        };
    }
  };

  const hideAlert = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`alert_closed_${id}`, "true");
    }
    setHiddenAlertIds(prev => [...prev, id]);
  };

  return (
    <div className="space-y-4 mb-6">
      {visibleAlerts.map((alert) => {
        const { bg, icon } = getAlertStyle(alert.type);
        return (
          <div 
            key={alert.id} 
            className={`flex items-start p-4 rounded-xl ${bg} text-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 relative group`}
          >
            {icon}
            <div className="flex-1 pr-6">
              <p className="text-sm font-bold leading-none mb-1">{alert.title}</p>
              <p className="text-xs opacity-90 leading-normal">{alert.content}</p>
            </div>
            <button 
              onClick={() => hideAlert(alert.id)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
