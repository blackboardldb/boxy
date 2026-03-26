"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Save, X, Globe, Building2, Palette } from "lucide-react";
import SquareLogo from "@/components/SquareLogo";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ConfiguracionesPage() {
  const { initialOrganization, updateOrganization, fetchOrganization } = useBlackSheepStore();
  const { toast } = useToast();
  
  // States for general info
  const [centerName, setCenterName] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // States for logos
  const [logoHorizontalSvg, setLogoHorizontalSvg] = useState("");
  const [logoSquareSvg, setLogoSquareSvg] = useState("");

  // Fetch organization on mount if not available
  useEffect(() => {
    if (!initialOrganization) {
      fetchOrganization();
    }
  }, [initialOrganization, fetchOrganization]);

  // Sync local state with store data
  useEffect(() => {
    if (initialOrganization) {
      setCenterName(initialOrganization.name || "");
      if (initialOrganization.branding) {
        const branding = initialOrganization.branding as any;
        setLogoHorizontalSvg(branding.logoHorizontalSvg || branding.logoSvg || "");
        setLogoSquareSvg(branding.logoSquareSvg || "");
      }
    }
  }, [initialOrganization]);

  const handleSave = async () => {
    if (!initialOrganization) return;
    
    setIsSaving(true);
    try {
      const updatedOrg = {
        ...initialOrganization,
        name: centerName,
        branding: {
          ...initialOrganization.branding,
          logoHorizontalSvg,
          logoSquareSvg,
        },
      };
      
      const success = await updateOrganization(updatedOrg);
      
      if (success) {
        toast({
          title: "Configuración actualizada",
          description: "La información del centro se ha guardado correctamente.",
        });
        setEditingSection(null);
      } else {
        throw new Error("Failed to update organization");
      }
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo actualizar la configuración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset local state to store values
    if (initialOrganization) {
      setCenterName(initialOrganization.name || "");
      if (initialOrganization.branding) {
        const branding = initialOrganization.branding as any;
        setLogoHorizontalSvg(branding.logoHorizontalSvg || branding.logoSvg || "");
        setLogoSquareSvg(branding.logoSquareSvg || "");
      }
    }
    setEditingSection(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuraciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de identidad visual y parámetros generales del centro.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-5xl">
        {/* Información del Centro - Airbnb Style */}
        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Información del Centro</CardTitle>
                <CardDescription className="text-xs">Nombre y logotipos principales</CardDescription>
              </div>
            </div>
            {editingSection !== "identity" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingSection("identity")}
                className="rounded-xl px-4 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-all font-semibold text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-2" /> Editar
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            {editingSection !== "identity" ? (
              /* VISTA LECTURA */
              <div className="divide-y divide-slate-50 dark:divide-slate-900">
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre del Centro</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 italic">{centerName || "No definido"}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logo Horizontal</p>
                    <div className="h-12 flex items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl px-4 border border-slate-100 dark:border-slate-800 overflow-hidden">
                      {logoHorizontalSvg ? <Logo size={120} /> : <span className="text-xs text-slate-400 italic">Sin configurar</span>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logo Cuadrado</p>
                    <div className="h-12 w-12 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                      {logoSquareSvg ? <SquareLogo size={32} /> : <span className="text-[10px] text-slate-400 italic">N/A</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* VISTA EDICIÓN */
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold flex items-center gap-2">
                       <Globe className="w-4 h-4 text-primary" /> Nombre Público del Centro
                    </Label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 tracking-tighter uppercase">Visible en Login y Dashboard</span>
                  </div>
                  <input 
                    type="text" 
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="Ej. BlackSheep CrossFit"
                    className="w-full p-4 text-sm font-medium border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" /> Logo Horizontal (SVG)
                      </Label>
                    </div>
                    <textarea
                      rows={6}
                      className="w-full p-4 font-mono text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="<svg ...> ... </svg>"
                      value={logoHorizontalSvg}
                      onChange={(e) => setLogoHorizontalSvg(e.target.value)}
                    />
                    <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/30">
                       <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Previsualización Navbar</p>
                       <div className="h-10 flex items-center"><Logo size={100} /></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" /> Logo Cuadrado (SVG)
                      </Label>
                    </div>
                    <textarea
                      rows={6}
                      className="w-full p-4 font-mono text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="<svg ...> ... </svg>"
                      value={logoSquareSvg}
                      onChange={(e) => setLogoSquareSvg(e.target.value)}
                    />
                    <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/30">
                       <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Previsualización Login</p>
                       <div className="h-10 flex items-center"><SquareLogo size={40} /></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 dark:border-slate-900">
                  <Button 
                    variant="ghost" 
                    onClick={handleCancel}
                    className="rounded-xl px-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="rounded-xl px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 font-bold"
                  >
                    {isSaving ? "Guardando..." : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Canales de Comunicación Card */}
        <Card className="rounded-xl border shadow-md border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 overflow-hidden">
          <CardHeader className="px-6 py-4 bg-slate-50/30 dark:bg-slate-900/10">
            <CardTitle className="text-base font-bold">Canales de Comunicación</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-transparent transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl shadow-inner">✨</div>
                <div>
                  <p className="font-bold text-sm">Gestión de Banners Activos</p>
                  <p className="text-[11px] text-muted-foreground">Carrusel de anuncios internos para alumnos</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl px-6 border-2 font-bold hover:bg-primary hover:text-white transition-all">
                <a href="/admin/configuraciones/banners">Gestionar Banners</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

