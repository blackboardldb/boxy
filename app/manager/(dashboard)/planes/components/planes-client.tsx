"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function PlanesClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/manager/api/planes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          maxActiveStudents: parseInt(newLimit),
          priceMonthly: parseInt(newPrice || "0") * 100,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setPlans([...plans, data.data]);
      setShowCreate(false);
      setNewName("");
      setNewLimit("");
      setNewPrice("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/manager/api/planes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setPlans(plans.map(p => p.id === id ? data.data : p));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Planes SaaS</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200"
        >
          {showCreate ? "Cancelar" : "Nuevo Plan"}
        </button>
      </div>

      {showCreate && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
          <h2 className="font-medium text-sm">Crear nuevo plan</h2>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-zinc-400">Nombre</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: PREMIUM" className="bg-zinc-950 border-zinc-800 mt-1" />
            </div>
            <div className="w-32">
              <label className="text-xs text-zinc-400">Límite</label>
              <Input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} placeholder="Ej: 200" className="bg-zinc-950 border-zinc-800 mt-1" />
            </div>
            <div className="w-32">
              <label className="text-xs text-zinc-400">Precio (CLP)</label>
              <Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Ej: 50000" className="bg-zinc-950 border-zinc-800 mt-1" />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading || !newName || !newLimit || !newPrice}
            className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      )}

      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase font-medium">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Límite Alumnos</th>
              <th className="px-4 py-3">Precio/Mes</th>
              <th className="px-4 py-3">Centros</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {plans.map(plan => (
              <PlanRow key={plan.id} plan={plan} onUpdate={handleUpdate} />
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No hay planes creados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-zinc-500 max-w-2xl">
        Nota: Al editar el límite de un plan, solo afectará a los nuevos centros a los que se asigne este plan. Los centros que ya tienen este plan asignado mantendrán su límite original intacto por integridad histórica.
      </p>
    </div>
  );
}

function PlanRow({ plan, onUpdate }: { plan: any; onUpdate: (id: string, updates: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(plan.name);
  const [limit, setLimit] = useState(plan.maxActiveStudents.toString());
  const [price, setPrice] = useState((plan.priceMonthly / 100).toString());

  const handleSave = () => {
    onUpdate(plan.id, { name, maxActiveStudents: parseInt(limit), priceMonthly: parseInt(price) * 100 });
    setEditing(false);
  };

  return (
    <tr className="hover:bg-zinc-800/50 transition-colors group">
      <td className="px-4 py-3">
        {editing ? (
          <Input value={name} onChange={e => setName(e.target.value)} className="h-8 bg-zinc-950 border-zinc-700" />
        ) : (
          <span className="font-medium">{plan.name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <Input type="number" value={limit} onChange={e => setLimit(e.target.value)} className="h-8 w-24 bg-zinc-950 border-zinc-700" />
        ) : (
          <span>{plan.maxActiveStudents}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-8 w-24 bg-zinc-950 border-zinc-700" />
        ) : (
          <span>{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(plan.priceMonthly / 100)}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-zinc-400">{plan._count.organizations} asignados</span>
      </td>
      <td className="px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => onUpdate(plan.id, { isActive: !plan.isActive })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${plan.isActive ? 'bg-green-500' : 'bg-zinc-700'}`}
        >
          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${plan.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
        {editing ? (
          <div className="flex gap-2 ml-auto">
            <button onClick={handleSave} className="text-xs text-blue-400 hover:text-blue-300">Guardar</button>
            <button onClick={() => setEditing(false)} className="text-xs text-zinc-400 hover:text-white">Cancelar</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs text-zinc-500 hover:text-white ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
        )}
      </td>
    </tr>
  );
}
