import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PaymentModal } from "./centros/components/payment-modal";

export default async function ManagerPage() {
  await requireManager();

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      _count: { select: { members: true } },
    },
  });

  const statusColors: Record<string, string> = {
    TRIAL: "bg-yellow-500/20 text-yellow-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    SUSPENDED: "bg-red-500/20 text-red-400",
    CANCELED: "bg-zinc-500/20 text-zinc-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Centros</h1>
          <span className="text-zinc-500 text-sm">{organizations.length} centros registrados</span>
        </div>
        <Link
          href="/manager/centros/nuevo"
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          Crear nuevo centro
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No hay centros registrados todavía.</p>
          <p className="text-zinc-600 text-sm mt-1">Crea uno manualmente en Supabase.</p>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="text-left px-4 py-3">Centro</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Alumnos</th>
                <th className="text-left px-4 py-3">Registrado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{org.name}</td>
                  <td className="px-4 py-3 font-mono text-zinc-400">{org.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[org.status] ?? "bg-zinc-700 text-zinc-300"}`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{org._count.members}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(org.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <PaymentModal organizationId={org.id} />
                    <Link
                      href={`/manager/centros/${org.id}`}
                      className="text-zinc-400 hover:text-white transition-colors text-xs underline underline-offset-2"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
