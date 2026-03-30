"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Calendar, 
  Info, 
  AlertTriangle, 
  XOctagon, 
  Megaphone,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InAppAlert {
  id: string;
  title: string;
  content: string;
  type: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export function AlertsManager() {

  const [alerts, setAlerts] = useState<InAppAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("noticia");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const resp = await fetch("/api/admin/alerts");
      const data = await resp.json();
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !startDate || !endDate) {
      console.warn("Campos incompletos para la alerta.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          type,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });

      if (resp.ok) {
        setTitle("");
        setContent("");
        fetchAlerts();
      } else {
        throw new Error("Failed to create alert");
      }
    } catch (error) {
      console.error("Error al crear alerta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta alerta?")) return;

    try {
      const resp = await fetch(`/api/admin/alerts/${id}`, {
        method: "DELETE",
      });

      if (resp.ok) {
        fetchAlerts();
      } else {
        throw new Error("Failed to delete alert");
      }
    } catch (error) {
      console.error("Error al eliminar alerta:", error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "noticia": return <Megaphone className="w-4 h-4" />;
      case "cancelacion": return <XOctagon className="w-4 h-4" />;
      case "advertencia": return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "noticia": return "bg-[#2286f1]";
      case "cancelacion": return "bg-[#e54343]";
      case "advertencia": return "bg-[#e77a20]";
      default: return "bg-gray-500";
    }
  };

  const getAlertLabel = (type: string) => {
    switch (type) {
      case "noticia": return "Noticia";
      case "cancelacion": return "Cancelación";
      case "advertencia": return "Advertencia";
      default: return type;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Columna Izquierda: Crear Alerta */}
      <Card className="rounded-xl border shadow-sm border-zinc-100 bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Alertas In-App</CardTitle>
              <CardDescription className="text-xs">Crea nuevas alertas para los alumnos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Desde</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="startDate" 
                    type="date" 
                    className="pl-9 rounded-xl"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Hasta</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="endDate" 
                    type="date" 
                    className="pl-9 rounded-xl"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                placeholder="Título de la alerta" 
                className="rounded-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea 
                id="content" 
                placeholder="Mensaje de la alerta..." 
                className="rounded-xl min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Alerta</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noticia">Noticia</SelectItem>
                  <SelectItem value="cancelacion">Cancelación</SelectItem>
                  <SelectItem value="advertencia">Advertencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl font-bold shadow-lg shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" /> Publicar Alerta</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Columna Derecha: Historial */}
      <Card className="rounded-xl border shadow-sm border-zinc-100 bg-white">
        <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-6 py-4">
          <CardTitle className="text-lg font-bold">Historial de Alertas</CardTitle>
          <CardDescription className="text-xs">Alertas publicadas y programadas</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-xs font-medium">Cargando alertas...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs font-medium italic">No hay alertas registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-6 transition-colors hover:bg-zinc-50/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-lg text-white ${getAlertColor(alert.type)}`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {getAlertLabel(alert.type)}
                            </span>
                            <span className="text-[10px] text-zinc-300">•</span>
                            <span className="text-[10px] font-medium text-zinc-400">
                              {format(new Date(alert.startDate), "dd/MM/yy")} - {format(new Date(alert.endDate), "dd/MM/yy")}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-zinc-900">{alert.title}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{alert.content}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-red-500 transition-colors h-8 w-8"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
