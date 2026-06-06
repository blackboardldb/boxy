"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoCentroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calcular ciclo según fecha
  const hoy = new Date().getDate();
  const defaultCycle = hoy <= 14 ? "A" : "B";

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    billingCycle: defaultCycle,
    email: "",
    phone: "",
    address: "",
    ownerName: "",
    ownerLastName: "",
    ownerRut: "",
    adminEmail: "",
    adminFirstName: "",
    adminLastName: "",
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/manager/api/centros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el centro");
      }

      router.push(`/manager/centros/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/manager" className="text-zinc-500 text-sm hover:text-white transition-colors">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold mt-2">Crear nuevo centro</h1>
        <p className="text-zinc-500 text-sm">Ingresa los datos del centro y su administrador principal.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos del centro */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium border-b border-zinc-800 pb-2">1. Datos del Centro</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Nombre *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                placeholder="Ej. Boxy Fitness"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Slug *</label>
              <input
                required
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-zinc-500"
              />
              <p className="text-xs text-zinc-500">subdominio: {formData.slug || "..."}.boxy.app</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Email de contacto</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Ciclo de Billing</label>
            <select
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            >
              <option value="A">Ciclo A (Vence el día 10)</option>
              <option value="B">Ciclo B (Vence el día 25)</option>
            </select>
          </div>
        </div>

        {/* Administrador */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium border-b border-zinc-800 pb-2">2. Administrador Principal</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Nombre *</label>
              <input
                required
                type="text"
                name="adminFirstName"
                value={formData.adminFirstName}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Apellido *</label>
              <input
                required
                type="text"
                name="adminLastName"
                value={formData.adminLastName}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Email *</label>
            <input
              required
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
          <Link
            href="/manager"
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Centro"}
          </button>
        </div>
      </form>
    </div>
  );
}
