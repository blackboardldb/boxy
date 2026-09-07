"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RefreshCw } from "lucide-react";

export function DefaultPasswords({ orgId }: { orgId: string }) {
  const [passwords, setPasswords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

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

  const resetAdminPasswords = async () => {
    if (
      !confirm(
        "¿Estás seguro? Esta acción restablecerá la contraseña de TODOS los administradores de este centro a la clave por defecto actual. Quedará registrado en el log de auditoría."
      )
    )
      return;

    setResetLoading(true);
    setResetMsg(null);
    setError(null);
    try {
      const res = await fetch(`/manager/api/centros/${orgId}/reset-admin-passwords`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) throw new Error(data.error || "Error al restablecer");
      setResetMsg(data.message || data.error || "Operación completada.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResetLoading(false);
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
              Las contraseñas iniciales del centro se almacenan de forma segura. Visualizarlas
              dejará un registro en el log de auditoría.
            </p>
            <Button
              onClick={fetchPasswords}
              disabled={loading}
              variant="outline"
              className="bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800"
            >
              {loading ? "Obteniendo..." : "Revelar Contraseñas"}
            </Button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Admin
                </span>
                <code className="text-sm text-zinc-200 bg-zinc-900 px-2 py-1 rounded block">
                  {passwords.adminPassword || "No definida"}
                </code>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Alumno
                </span>
                <code className="text-sm text-zinc-200 bg-zinc-900 px-2 py-1 rounded block">
                  {passwords.studentPassword || "No definida"}
                </code>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Coach
                </span>
                <code className="text-sm text-zinc-200 bg-zinc-900 px-2 py-1 rounded block">
                  {passwords.coachPassword || "No definida"}
                </code>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-[10px] text-zinc-500 italic">
                Esta acción ha sido registrada en el log de auditoría.
              </p>
              <div className="flex gap-2 flex-wrap">
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
                {/* Botón de rescate: aplica la defaultAdminPassword a todos los admins en Supabase */}
                <Button
                  onClick={resetAdminPasswords}
                  disabled={resetLoading || !passwords.adminPassword}
                  size="sm"
                  variant="outline"
                  className="border-amber-600 text-amber-400 hover:bg-amber-950 text-xs h-8 gap-1.5"
                  title={
                    !passwords.adminPassword
                      ? "Generá una contraseña de admin primero"
                      : "Restablece la contraseña de todos los administradores del centro a la clave por defecto"
                  }
                >
                  {resetLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3 w-3" />
                  )}
                  {resetLoading ? "Restableciendo..." : "Resetear acceso a Admins"}
                </Button>
              </div>
            </div>

            {resetMsg && (
              <p className="text-emerald-400 text-xs border border-emerald-800 bg-emerald-950/40 rounded px-3 py-2">
                ✓ {resetMsg}
              </p>
            )}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
