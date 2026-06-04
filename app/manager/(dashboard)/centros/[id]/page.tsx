import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CentroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManager();
  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { joinedAt: "desc" },
      },
      payments: { orderBy: { paidAt: "desc" }, take: 20 },
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!org) notFound();

  const statusColors: Record<string, string> = {
    TRIAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/manager" className="text-zinc-500 text-sm hover:text-white transition-colors">
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold mt-2">{org.name}</h1>
          <p className="text-zinc-500 font-mono text-sm">{org.slug} · {org.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[org.status] ?? ""}`}>
          {org.status}
        </span>
      </div>

      {/* Tabs (static — Fase 5 full implementation) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Alumnos */}
        <div className="lg:col-span-2 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
            👥 Miembros ({org.members.length})
          </div>
          <div className="divide-y divide-zinc-800">
            {org.members.length === 0 ? (
              <p className="px-4 py-6 text-zinc-600 text-sm text-center">Sin miembros</p>
            ) : (
              org.members.map((m: any) => (
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
        </div>

        {/* Eventos */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
            📋 Eventos recientes
          </div>
          <div className="divide-y divide-zinc-800">
            {org.events.length === 0 ? (
              <p className="px-4 py-6 text-zinc-600 text-sm text-center">Sin eventos</p>
            ) : (
              org.events.map((e: any) => (
                <div key={e.id} className="px-4 py-3 text-xs">
                  <p className="font-mono text-zinc-400">{e.type}</p>
                  <p className="text-zinc-500 mt-0.5">{e.message}</p>
                  <p className="text-zinc-700 mt-1">{new Date(e.createdAt).toLocaleString("es-CL")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagos */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
          💳 Historial de pagos
        </div>
        {org.payments.length === 0 ? (
          <p className="px-4 py-6 text-zinc-600 text-sm text-center">Sin pagos registrados</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-zinc-500 text-xs">
              <tr>
                <th className="text-left px-4 py-2">Fecha</th>
                <th className="text-left px-4 py-2">Monto</th>
                <th className="text-left px-4 py-2">Método</th>
                <th className="text-left px-4 py-2">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {org.payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-zinc-400">{new Date(p.paidAt).toLocaleDateString("es-CL")}</td>
                  <td className="px-4 py-3 font-mono">{(p.amount / 100).toLocaleString("es-CL")} {p.currency}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.method ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
