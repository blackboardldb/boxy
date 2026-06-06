"use client";
import { useState } from "react";

interface Member {
  id: string;
  role: string;
  status: string;
  user: { firstName: string; lastName: string; email: string };
}

export function MembersList({ members }: { members: Member[] }) {
  const [showAlumnos, setShowAlumnos] = useState(false);
  
  const staff = members.filter(m => ['ADMIN', 'COACH'].includes(m.role));
  const alumnos = members.filter(m => m.role === 'ALUMNO');

  return (
    <div className="lg:col-span-2 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
        👥 Equipo ({staff.length})
      </div>
      <div className="divide-y divide-zinc-800">
        {staff.length === 0 ? (
          <p className="px-4 py-6 text-zinc-600 text-sm text-center">Sin administradores</p>
        ) : (
          staff.map((m) => (
            <div key={m.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{m.user.firstName} {m.user.lastName}</p>
                <p className="text-zinc-500">{m.user.email}</p>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 text-xs">{m.role}</span>
                <p className="text-zinc-600 text-xs">{m.status}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alumnos colapsable */}
      {alumnos.length > 0 && (
        <div className="border-t border-zinc-800">
          <button
            onClick={() => setShowAlumnos(!showAlumnos)}
            className="w-full px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors flex items-center justify-between"
          >
            <span>🎓 Alumnos ({alumnos.length})</span>
            <span className="text-xs">{showAlumnos ? "▲ Ocultar" : "▼ Ver"}</span>
          </button>
          {showAlumnos && (
            <div className="divide-y divide-zinc-800">
              {alumnos.map((m) => (
                <div key={m.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{m.user.firstName} {m.user.lastName}</p>
                    <p className="text-zinc-500">{m.user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-600 text-xs">{m.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
