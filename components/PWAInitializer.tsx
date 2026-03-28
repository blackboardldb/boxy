"use client";

import { useEffect } from "react";
import { initializePWA } from "@/lib/register-sw";

export default function PWAInitializer() {
  useEffect(() => {
    // Solo inicializar en el navegador y en producción (opcional, pero recomendado)
    if (typeof window !== "undefined") {
      initializePWA();
    }
  }, []);

  return null; // Este componente no renderiza nada visualmente
}
