"use client";
import { useState, useEffect } from "react";
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
  country?: string | null;
  region?: string | null;
  city?: string | null;
  billingPlan?: string | null;
  billingCycle?: string | null;
  saasPlanId?: string | null;
  saasPlanLimit?: number | null;
  saasPlanPrice?: number | null;
  overrideMaxActiveStudents?: number | null;
}

export function EditCenterForm({ org }: { org: Org }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<{ id: string; name: string; maxActiveStudents: number; priceMonthly: number; isActive: boolean }[]>([]);

  const [form, setForm] = useState({
    name:          org.name          ?? "",
    email:         org.email         ?? "",
    phone:         org.phone         ?? "",
    address:       org.address       ?? "",
    ownerName:     org.ownerName     ?? "",
    ownerLastName: org.ownerLastName ?? "",
    ownerRut:      org.ownerRut      ?? "",
    country:       org.country       ?? "Chile",
    region:        org.region        ?? "",
    city:          org.city          ?? "",
    billingPlan:   org.billingPlan   ?? "boxy_base",
    billingCycle:  org.billingCycle  ?? "A",
    saasPlanId:    org.saasPlanId    ?? "",
    overrideMaxActiveStudents: org.overrideMaxActiveStudents?.toString() ?? "",
  });

  useEffect(() => {
    fetch("/manager/api/planes")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPlans(json.data);
      })
      .catch(console.error);
  }, []);

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
        body: JSON.stringify({
          ...form,
          overrideMaxActiveStudents: form.overrideMaxActiveStudents ? parseInt(form.overrideMaxActiveStudents) : null,
        }),
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
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">País</label>
            <Input value={form.country} onChange={set("country")} className="bg-zinc-900 border-zinc-700" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Región</label>
            <select
              value={form.region}
              onChange={set("region")}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            >
              <option value="">Selecciona una región</option>
              <option value="Arica y Parinacota">Arica y Parinacota</option>
              <option value="Tarapacá">Tarapacá</option>
              <option value="Antofagasta">Antofagasta</option>
              <option value="Atacama">Atacama</option>
              <option value="Coquimbo">Coquimbo</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Metropolitana de Santiago">Metropolitana de Santiago</option>
              <option value="Libertador General Bernardo O'Higgins">Libertador General Bernardo O'Higgins</option>
              <option value="Maule">Maule</option>
              <option value="Ñuble">Ñuble</option>
              <option value="Biobío">Biobío</option>
              <option value="La Araucanía">La Araucanía</option>
              <option value="Los Ríos">Los Ríos</option>
              <option value="Los Lagos">Los Lagos</option>
              <option value="Aysén del General Carlos Ibáñez del Campo">Aysén del General Carlos Ibáñez del Campo</option>
              <option value="Magallanes y de la Antártica Chilena">Magallanes y de la Antártica Chilena</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Ciudad</label>
            <Input value={form.city} onChange={set("city")} className="bg-zinc-900 border-zinc-700" placeholder="Ej. Santiago" />
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

      {/* Plan SaaS */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Plan SaaS
        </h2>
        
        {org.saasPlanId && (
          <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-lg mb-4 text-sm max-w-2xl">
            <p className="text-zinc-400 mb-2 font-medium">Snapshot Actual</p>
            <div className="flex gap-8">
              <p>
                Límite: <span className="font-medium text-white">{org.saasPlanLimit ?? "N/A"}</span>
              </p>
              <p>
                Precio: <span className="font-medium text-white">{org.saasPlanPrice != null ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(org.saasPlanPrice / 100) : "N/A"}</span>
              </p>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Estos valores quedaron congelados al momento de asignar el plan al centro. 
              Si cambias el plan, se generará un nuevo snapshot con los valores vigentes de hoy.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Nivel de Plan</label>
            <select
              value={form.saasPlanId ?? ""}
              onChange={set("saasPlanId")}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              <option value="">Sin plan</option>
              {plans
                .filter(p => p.isActive || p.id === form.saasPlanId)
                .map(p => {
                  const formattedPrice = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(p.priceMonthly / 100);
                  return (
                    <option key={p.id} value={p.id}>{p.name} (Máx {p.maxActiveStudents}) — {formattedPrice}</option>
                  );
                })}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Override de Límite (Alumnos Activos)</label>
            <Input 
              type="number" 
              placeholder="Opcional" 
              value={form.overrideMaxActiveStudents} 
              onChange={set("overrideMaxActiveStudents")} 
              className="bg-zinc-900 border-zinc-700" 
            />
            <p className="text-[10px] text-zinc-500 leading-tight mt-1">
              Si se define, este valor reemplazará el límite del plan seleccionado.
            </p>
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
