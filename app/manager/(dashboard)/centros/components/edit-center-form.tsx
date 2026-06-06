"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface Org {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  ownerName?: string | null;
  ownerLastName?: string | null;
  ownerRut?: string | null;
  billingPlan?: string | null;
  billingCycle?: string | null;
}

export function EditCenterForm({ org }: { org: Org }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name:          org.name          ?? "",
    email:         org.email         ?? "",
    phone:         org.phone         ?? "",
    address:       org.address       ?? "",
    ownerName:     org.ownerName     ?? "",
    ownerLastName: org.ownerLastName ?? "",
    ownerRut:      org.ownerRut      ?? "",
    billingPlan:   org.billingPlan   ?? "boxy_base",
    billingCycle:  org.billingCycle  ?? "A",
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/manager/api/centros/${org.id}/info`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }
      router.push(`/manager/centros/${org.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Datos del centro */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Datos del centro
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Nombre *</label>
            <Input value={form.name} onChange={set("name")} className="bg-zinc-900 border-zinc-700" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Slug</label>
            <Input value={org.slug} disabled className="bg-zinc-900 border-zinc-800 opacity-40 cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Email de contacto</label>
            <Input value={form.email} onChange={set("email")} className="bg-zinc-900 border-zinc-700" />
            <p className="text-[10px] text-zinc-500 leading-tight mt-1">
              Solo notificaciones al centro. El acceso se gestiona mediante el administrador.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Teléfono</label>
            <Input value={form.phone} onChange={set("phone")} className="bg-zinc-900 border-zinc-700" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-zinc-400">Dirección</label>
            <Input value={form.address} onChange={set("address")} className="bg-zinc-900 border-zinc-700" />
          </div>
        </div>
      </section>

      {/* Datos del dueño */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Representante Legal / Facturación
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Nombre</label>
            <Input value={form.ownerName} onChange={set("ownerName")} className="bg-zinc-900 border-zinc-700" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Apellido</label>
            <Input value={form.ownerLastName} onChange={set("ownerLastName")} className="bg-zinc-900 border-zinc-700" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">RUT</label>
            <Input value={form.ownerRut} onChange={set("ownerRut")} className="bg-zinc-900 border-zinc-700" />
          </div>
        </div>
      </section>

      {/* Billing */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Billing
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Plan</label>
            <Input value={form.billingPlan} onChange={set("billingPlan")} className="bg-zinc-900 border-zinc-700" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Ciclo</label>
            <select
              value={form.billingCycle}
              onChange={set("billingCycle")}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              <option value="A">Ciclo A — vence el día 10</option>
              <option value="B">Ciclo B — vence el día 25</option>
            </select>
          </div>
        </div>
      </section>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-zinc-700 text-sm rounded-lg hover:bg-zinc-900 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
