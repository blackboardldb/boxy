"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DefaultPasswords({ orgId }: { orgId: string }) {
  const [passwords, setPasswords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPasswords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/manager/api/centros/${orgId}/passwords`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener contraseñas");
      setPasswords(data.passwords);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePasswords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/manager/api/centros/${orgId}/passwords`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar contraseñas");
      setPasswords(data.passwords);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden mt-6">
      <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 flex items-center justify-between">
        <span>🔐 Accesos Iniciales</span>
      </div>
      <div className="p-4">
        {!passwords ? (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-zinc-500 text-sm mb-4 text-center max-w-md">
              Las contraseñas iniciales del centro se almacenan de forma segura. Visualizarlas dejará un registro en el log de auditoría.
            </p>
            <Button onClick={fetchPasswords} disabled={loading} variant="outline" className="bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800">
              {loading ? "Obteniendo..." : "Revelar Contraseñas"}
            </Button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Admin</span>
                <code className="text-sm text-zinc-200 bg-zinc-900 px-2 py-1 rounded block">{passwords.adminPassword || "No definida"}</code>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Alumno</span>
                <code className="text-sm text-zinc-200 bg-zinc-900 px-2 py-1 rounded block">{passwords.studentPassword || "No definida"}</code>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Coach</span>
                <code className="text-sm text-zinc-200 bg-zinc-900 px-2 py-1 rounded block">{passwords.coachPassword || "No definida"}</code>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-zinc-500 italic">
                Esta acción ha sido registrada en el log de auditoría.
              </p>
              {!passwords.adminPassword && (
                <Button 
                  onClick={generatePasswords} 
                  disabled={loading} 
                  size="sm"
                  variant="default" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                >
                  {loading ? "Generando..." : "Generar Nuevas"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
