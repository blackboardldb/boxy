"use client";

import { useEffect, useState } from "react";
import { Megaphone, XOctagon, AlertTriangle, Info, X } from "lucide-react";

interface InAppAlert {
  id: string;
  title: string;
  content: string;
  type: string;
}

export function InAppAlerts() {
  const [alerts, setAlerts] = useState<InAppAlert[]>([]);
  const [hiddenAlerts, setHiddenAlerts] = useState<string[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const resp = await fetch("/api/alerts");
        if (!resp.ok) throw new Error("Failed to fetch");
        const data = await resp.json();
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();
  }, []);

  const visibleAlerts = alerts.filter(a => !hiddenAlerts.includes(a.id));

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
    setHiddenAlerts(prev => [...prev, id]);
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
