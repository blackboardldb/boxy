import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEgreso } from "@/lib/react-query/hooks/useEgresos";
import { Plus } from "lucide-react";

export function AddExpenseModal({
  year,
  month,
  trigger,
}: {
  year: number;
  month: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [monto, setMonto] = useState("");
  const createEgreso = useCreateEgreso(year, month);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo || !fecha || !monto || isNaN(Number(monto))) return;

    createEgreso.mutate(
      { motivo, fecha, monto: Number(monto) },
      {
        onSuccess: () => {
          setMotivo("");
          setFecha(new Date().toISOString().split("T")[0]);
          setMonto("");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs flex items-center gap-1.5 border-0">
            <Plus className="h-4 w-4" />
            Agregar gasto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Egreso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Motivo</Label>
            <Input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Monto</Label>
            <Input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
              min={0}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                createEgreso.isPending || !motivo || !fecha || !monto || isNaN(Number(monto))
              }
            >
              {createEgreso.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
