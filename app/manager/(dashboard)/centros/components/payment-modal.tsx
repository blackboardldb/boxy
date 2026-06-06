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

export function PaymentModal({ organizationId, trigger }: { organizationId: string, trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: "",
    method: "Transferencia",
    paidAt: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const amountInt = parseInt(formData.amount, 10);
      if (isNaN(amountInt) || amountInt <= 0) {
        throw new Error("Monto inválido");
      }

      // amount in cents for CLP? The user said "en CLP entero, el sistema multiplica x100 al guardar"
      const amountInCents = amountInt * 100;

      const res = await fetch(`/manager/api/centros/${organizationId}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInCents,
          method: formData.method,
          paidAt: formData.paidAt,
          notes: formData.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar pago");
      }

      setOpen(false);
      setFormData({
        amount: "",
        method: "Transferencia",
        paidAt: new Date().toISOString().split('T')[0],
        notes: "",
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-xs h-7 px-2 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800">
            $ Pago
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Registra un nuevo pago manual para el centro. El periodo de facturación se calculará automáticamente.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Monto (CLP) *</label>
            <input
              required
              type="number"
              name="amount"
              min="1"
              value={formData.amount}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Ej. 50000"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Método *</label>
            <select
              required
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Fecha de pago *</label>
            <input
              required
              type="date"
              name="paidAt"
              value={formData.paidAt}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Opcional..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-800 bg-transparent text-white hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {loading ? "Registrando..." : "Confirmar Pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
