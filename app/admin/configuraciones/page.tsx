"use client";

import { useState, useEffect } from "react";
import Logo from "@/components/Logo";

import { Edit, Save, X, Globe, Building2, Palette } from "lucide-react";
import SquareLogo from "@/components/SquareLogo";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertsManager } from "@/components/admincomponents/alerts-manager";

export default function ConfiguracionesPage() {
  const { initialOrganization, updateOrganization, fetchOrganization } = useBlackSheepStore();

  
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
        setEditingSection(null);
      } else {
        throw new Error("Failed to update organization");
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
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
        <Card className="rounded-xl border border-zinc-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 bg-zinc-50/50 px-6 py-4">
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
                className="rounded-xl px-4 border-zinc-100 hover:bg-zinc-50 transition-all font-semibold text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-2" /> Editar
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            {editingSection !== "identity" ? (
              /* VISTA LECTURA */
              <div className="divide-y divide-zinc-50">
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre del Centro</p>
                    <p className="text-lg font-semibold text-zinc-900 italic">{centerName || "No definido"}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logo Horizontal</p>
                    <div className="h-12 flex items-center bg-zinc-50/50 rounded-xl px-4 border border-zinc-100 overflow-hidden">
                      {logoHorizontalSvg ? <Logo size={120} /> : <span className="text-xs text-zinc-400 italic">Sin configurar</span>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logo Cuadrado</p>
                    <div className="h-12 w-12 flex items-center justify-center bg-zinc-50/50 rounded-xl border border-zinc-100 overflow-hidden">
                      {logoSquareSvg ? <SquareLogo size={32} /> : <span className="text-[10px] text-zinc-400 italic">N/A</span>}
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-blue-100 text-blue-700 tracking-tighter uppercase">Visible en Login y Dashboard</span>
                  </div>
                  <input 
                    type="text" 
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="Ej. BlackSheep CrossFit"
                    className="w-full p-4 text-sm font-medium border border-zinc-100 rounded-xl bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
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
                      className="w-full p-4 font-mono text-xs border border-zinc-100 rounded-xl bg-zinc-50 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="<svg ...> ... </svg>"
                      value={logoHorizontalSvg}
                      onChange={(e) => setLogoHorizontalSvg(e.target.value)}
                    />
                    <div className="p-4 border border-dashed border-zinc-100 rounded-xl bg-white">
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
                      className="w-full p-4 font-mono text-xs border border-zinc-100 rounded-xl bg-zinc-50 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="<svg ...> ... </svg>"
                      value={logoSquareSvg}
                      onChange={(e) => setLogoSquareSvg(e.target.value)}
                    />
                    <div className="p-4 border border-dashed border-zinc-100 rounded-xl bg-white">
                       <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Previsualización Login</p>
                       <div className="h-10 flex items-center"><SquareLogo size={40} /></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-50">
                  <Button 
                    variant="ghost" 
                    onClick={handleCancel}
                    className="rounded-xl px-6 transition-all hover:bg-zinc-100 font-semibold"
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

        <AlertsManager />


      </div>
    </div>
  );
}

