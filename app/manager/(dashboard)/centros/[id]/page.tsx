import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PaymentModal } from "../components/payment-modal";
import { StatusSwitch } from "../components/status-switch";
import { DefaultPasswords } from "../components/default-passwords";
import { BrandingUploader } from "../components/branding-uploader";
import { CsvImporter } from "../components/csv-importer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function CentroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const manager = await requireManager();
  const { id } = await params;

  // BUG-07: se usa _count en lugar de include de members con PII.
  // Esta página está en el scope de Manager — el manager sólo debe ver conteos de billing,
  // no datos personales (nombre, email) de los alumnos/coaches del centro.
  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true } },
      payments: { orderBy: { paidAt: "desc" }, take: 20 },
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!org) notFound();

  const statusColors: Record<string, string> = {
    TRIAL: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    SUSPENDED: "bg-red-500/20 text-red-400 border-red-500/30",
    CANCELED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
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
          <p className="text-zinc-500 font-mono text-sm">
            {org.slug} · Ciclo {org.billingCycle || "A"} · Vence: {org.billingPeriodEnd ? new Date(org.billingPeriodEnd).toLocaleDateString("es-CL") : "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/manager/centros/${org.id}/editar`}
            className="px-4 py-1.5 border border-zinc-700 text-sm rounded-lg hover:bg-zinc-900 transition-colors"
          >
            Editar
          </Link>
          <StatusSwitch organizationId={org.id} currentStatus={org.status} />
        </div>
      </div>

      {/* Tabs (static — Fase 5 full implementation) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conteo de Miembros — BUG-07: no se expone lista de PII */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
            👥 Miembros
          </div>
          <div className="px-4 py-6 text-center">
            <p className="text-3xl font-bold">{org._count.members}</p>
            <p className="text-zinc-500 text-sm mt-1">miembros registrados</p>
          </div>
        </div>

        {/* Eventos */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
            📋 Eventos recientes
          </div>
          <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
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

      {/* Tabs de Gestión */}
      <Tabs defaultValue="pagos" className="w-full">
        <div className="w-full overflow-x-auto pb-2 -mb-2">
          <TabsList className="w-max min-w-full justify-start h-auto p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <TabsTrigger value="pagos" className="px-4 py-2 text-sm rounded-lg whitespace-nowrap data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all">💳 Pagos</TabsTrigger>
            <TabsTrigger value="accesos" className="px-4 py-2 text-sm rounded-lg whitespace-nowrap data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all">🔐 Accesos</TabsTrigger>
            <TabsTrigger value="branding" className="px-4 py-2 text-sm rounded-lg whitespace-nowrap data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all">🎨 Branding</TabsTrigger>
            <TabsTrigger value="importar" className="px-4 py-2 text-sm rounded-lg whitespace-nowrap data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all">📥 Importar</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pagos" className="mt-6">
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 flex items-center justify-between">
              <span>💳 Historial de pagos</span>
              <PaymentModal organizationId={org.id} />
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
        </TabsContent>

        <TabsContent value="accesos" className="mt-6">
          <DefaultPasswords orgId={org.id} />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <BrandingUploader orgId={org.id} initialIconUrl={org.customIconUrl} />
        </TabsContent>

        <TabsContent value="importar" className="mt-6">
          <CsvImporter orgId={org.id} managerRole={manager.role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
