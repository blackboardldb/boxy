"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";

export default function ConfiguracionesPage() {
  const { initialOrganization, updateOrganization } = useBlackSheepStore();
  
  // States for both variants
  const [logoHorizontalSvg, setLogoHorizontalSvg] = useState("");
  const [logoSquareSvg, setLogoSquareSvg] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Sync state with store on load
  useEffect(() => {
    if (initialOrganization?.branding) {
      const branding = initialOrganization.branding as any;
      setLogoHorizontalSvg(branding.logoHorizontalSvg || branding.logoSvg || "");
      setLogoSquareSvg(branding.logoSquareSvg || "");
    }
  }, [initialOrganization]);

  const handleSave = () => {
    if (initialOrganization) {
      const updatedOrg = {
        ...initialOrganization,
        branding: {
          ...initialOrganization.branding,
          logoHorizontalSvg,
          logoSquareSvg,
        },
      };
      updateOrganization(updatedOrg);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      console.log("Logos guardados localmente");
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuraciones</h1>
        <p className="text-muted-foreground">
          Gestión de identidad visual y comunicación
        </p>
      </div>

      <div className="space-y-6 max-w-6xl">
        {/* Identidad de Marca - Logo SVG Variants */}
        <Card className="border-none shadow-premium bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10 text-primary">🎨</span>
              Identidad de Marca (Multi-Logo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Logo Horizontal */}
              <div className="space-y-4 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-bold">Logo Horizontal</Label>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold">Navbar & App</span>
                </div>
                <p className="text-xs text-muted-foreground italic mb-4">
                  Usado en cabeceras, menús laterales y en la aplicación principal.
                </p>
                
                <textarea
                  rows={8}
                  className="w-full p-4 font-mono text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                  placeholder="<svg ...> Logo Horizontal </svg>"
                  value={logoHorizontalSvg}
                  onChange={(e) => setLogoHorizontalSvg(e.target.value)}
                />

                <div className="mt-4">
                  <Label className="text-xs font-semibold mb-2 block">Vista Previa Horizontal</Label>
                  <div className="flex items-center justify-center p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 min-h-[120px] overflow-hidden">
                    {logoHorizontalSvg ? (
                      <div className="text-foreground" dangerouslySetInnerHTML={{ __html: logoHorizontalSvg }} />
                    ) : (
                      <div className="opacity-20 grayscale scale-75"><Logo /></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Cuadrado/Circular */}
              <div className="space-y-4 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-bold">Logo Cuadrado / Icono</Label>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-bold">Login & Landing</span>
                </div>
                <p className="text-xs text-muted-foreground italic mb-4">
                  Ideal para la página de Login, Landing Page y elementos circulares.
                </p>
                
                <textarea
                  rows={8}
                  className="w-full p-4 font-mono text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                  placeholder="<svg ...> Logo Cuadrado </svg>"
                  value={logoSquareSvg}
                  onChange={(e) => setLogoSquareSvg(e.target.value)}
                />

                <div className="mt-4">
                  <Label className="text-xs font-semibold mb-2 block">Vista Previa Cuadrada</Label>
                  <div className="flex items-center justify-center p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 min-h-[120px] overflow-hidden">
                    {logoSquareSvg ? (
                      <div className="w-20 h-20 text-foreground" dangerouslySetInnerHTML={{ __html: logoSquareSvg }} />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs italic">Sin Icono</div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-center pt-4 border-t border-slate-100 dark:border-slate-900">
              <Button onClick={handleSave} className="px-12 rounded-full h-12 text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                {isSaved ? "✓ Cambios Guardados" : "Guardar Configuración Visual"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Banners */}
        <Card className="border-none shadow-premium overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          <CardHeader>
            <CardTitle className="text-lg">Canales de Comunicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl shadow-inner">✨</div>
                <div>
                  <p className="font-bold">Gestión de Banners Activos</p>
                  <p className="text-xs text-muted-foreground">Controla el carrusel de anuncios para alumnos</p>
                </div>
              </div>
              <Button asChild variant="outline" className="rounded-xl px-8 border-2 font-bold">
                <a href="/admin/configuraciones/banners">Gestionar Banners</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
