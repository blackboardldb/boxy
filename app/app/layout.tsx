"use client";

import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRenewalPage = pathname === "/app/renovar-plan";

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Suscripción a Push Notifications
    const setupPush = async () => {
      try {
        if ("Notification" in window && "serviceWorker" in navigator && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const registration = await navigator.serviceWorker.ready;
            
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });
            
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(subscription)
            });
          }
        }
      } catch (err) {
        console.error("Error setting up push notifications:", err);
      }
    };

    setupPush();

    // 2. Banner de instalación PWA
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Solo mostrar si no estamos ya en modo standalone
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {showInstallBanner && (
        <div className="bg-zinc-900 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[100] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold">Instalar BlackSheep</p>
              <p className="text-[10px] text-zinc-400">Accede más rápido desde tu pantalla de inicio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-[10px] font-bold px-3 rounded-full"
              onClick={handleInstallClick}
            >
              Instalar
            </Button>
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>
      )}
      {!isRenewalPage && <GlobalNav />}
      {children}
    </>
  );
}
