"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Calendar,
  AlertTriangle,
  XOctagon,
  Megaphone,
  Loader2,
  SendHorizontal,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useCreateAlert } from "@/lib/react-query/hooks/useAlerts";

/**
 * Formulario para crear nuevas alertas In-App.
 * Extraído de AlertsManager para usarse de forma independiente en el Tab 2 de /alertas.
 */
export function InAppAlertsCreator() {
  const createAlert = useCreateAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("noticia");
  const [sendPush, setSendPush] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !startDate || !endDate) return;

    setIsSubmitting(true);
    try {
      const startISO = new Date(`${startDate}T00:00:00.000Z`).toISOString();
      const endISO = new Date(`${endDate}T23:59:59.000Z`).toISOString();

      await createAlert.mutateAsync({
        title,
        content,
        type,
        startDate: startISO,
        endDate: endISO,
        sendPush: type === "cancelacion" ? true : sendPush,
      });

      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error al crear alerta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ia-startDate">Desde</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              id="ia-startDate"
              type="date"
              className="pl-9 rounded-xl"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ia-endDate">Hasta</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              id="ia-endDate"
              type="date"
              className="pl-9 rounded-xl"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="ia-title">Título</Label>
        <Input
          id="ia-title"
          placeholder="Título de la alerta"
          className="rounded-xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Contenido */}
      <div className="space-y-2">
        <Label htmlFor="ia-content">Contenido</Label>
        <Textarea
          id="ia-content"
          placeholder="Mensaje de la alerta..."
          className="rounded-xl min-h-[100px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Tipo */}
      <div className="space-y-2">
        <Label htmlFor="ia-type">Tipo de Alerta</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="noticia">
              <span className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5" /> Noticia
              </span>
            </SelectItem>
            <SelectItem value="cancelacion">
              <span className="flex items-center gap-2">
                <XOctagon className="w-3.5 h-3.5" /> Cancelación
              </span>
            </SelectItem>
            <SelectItem value="advertencia">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Advertencia
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Push notification toggle */}
      <div
        className={`p-4 rounded-xl border ${
          type === "cancelacion"
            ? "bg-red-50/50 border-red-100"
            : "bg-blue-50/50 border-blue-100"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                type === "cancelacion"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <SendHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-zinc-900">
                Notificación Push
              </h5>
              <p className="text-[10px] text-zinc-500">
                {type === "cancelacion"
                  ? "Se enviará notificación push automáticamente"
                  : "Enviar este aviso como notificación al móvil"}
              </p>
            </div>
          </div>
          {type !== "cancelacion" && (
            <Switch
              checked={sendPush}
              onCheckedChange={setSendPush}
              className="data-[state=checked]:bg-blue-600"
            />
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full rounded-xl font-bold shadow-lg shadow-primary/20"
        disabled={isSubmitting || !title || !content}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" /> Publicar Alerta
          </>
        )}
      </Button>
    </form>
  );
}
