"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  TRIAL: "bg-yellow-500/20 text-yellow-400",
  ACTIVE: "bg-green-500/20 text-green-400",
  SUSPENDED: "bg-red-500/20 text-red-400",
  CANCELED: "bg-zinc-500/20 text-zinc-400",
};

export function StatusSwitch({ 
  organizationId, 
  currentStatus 
}: { 
  organizationId: string, 
  currentStatus: string 
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus) return;

    if (targetStatus === "SUSPENDED" && !reason) {
      setError("El motivo es obligatorio para suspender.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/manager/api/centros/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason: reason || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar estado");
      }

      setOpen(false);
      setTargetStatus(null);
      setReason("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTransitions = () => {
    switch (currentStatus) {
      case "TRIAL":
        return ["ACTIVE", "CANCELED"];
      case "ACTIVE":
        return ["SUSPENDED", "CANCELED"];
      case "SUSPENDED":
        return ["ACTIVE", "CANCELED"];
      default:
        return [];
    }
  };

  const transitions = getTransitions();

  if (currentStatus === "CANCELED") {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium cursor-not-allowed opacity-75 ${statusColors.CANCELED}`}>
        CANCELED
      </span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setTargetStatus(null);
        setReason("");
        setError(null);
      }
    }}>
      <DialogTrigger asChild>
        <button className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 ${statusColors[currentStatus] || statusColors.CANCELED}`}>
          {currentStatus} ▾
        </button>
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado del centro</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Estado actual: <span className="font-semibold text-white">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>

        {!targetStatus ? (
          <div className="space-y-3 mt-4">
            <p className="text-sm text-zinc-400">Selecciona el nuevo estado:</p>
            <div className="grid grid-cols-1 gap-2">
              {transitions.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  className="justify-start border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white"
                  onClick={() => setTargetStatus(status)}
                >
                  <span className={`w-3 h-3 rounded-full mr-2 ${statusColors[status]?.split(' ')[0]}`} />
                  Cambiar a {status}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateStatus} className="space-y-4 mt-4">
            <div className="p-3 bg-zinc-900 rounded-lg text-sm border border-zinc-800">
              Vas a cambiar el estado a: <span className={`font-semibold ${statusColors[targetStatus]?.split(' ')[1]}`}>{targetStatus}</span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {targetStatus === "SUSPENDED" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300">Motivo de suspensión *</label>
                <input
                  required
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="Ej. Falta de pago recurrente"
                />
              </div>
            )}

            {targetStatus === "ACTIVE" && currentStatus === "SUSPENDED" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-300">Motivo o notas (Opcional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="Ej. Excepción temporal"
                />
              </div>
            )}

            {targetStatus === "CANCELED" && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                <strong>¿Estás seguro?</strong> Esta acción es definitiva y marcará al centro como cancelado permanentemente.
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTargetStatus(null);
                  setReason("");
                  setError(null);
                }}
                className="border-zinc-800 bg-transparent text-white hover:bg-zinc-800"
              >
                Volver
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={targetStatus === "CANCELED" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-white text-black hover:bg-zinc-200"}
              >
                {loading ? "Actualizando..." : "Confirmar cambio"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
