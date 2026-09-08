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

// Force-dynamic: garantiza que customIconUrl siempre se lea fresco de Prisma
// tras una subida de logo desde el mismo panel.
export const dynamic = "force-dynamic";

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
      plan: { select: { name: true, maxActiveStudents: true } },
      _count: { select: { members: true } },
      payments: { orderBy: { paidAt: "desc" }, take: 20 },
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!org) notFound();

  const activeStudents = await prisma.userMembership.count({
    where: {
      organizationId: id,
      status: "active",
      user: {
        memberships: {
          some: {
            organizationId: id,
            role: "ALUMNO",
          },
        },
      },
    },
  });

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
            className="flex items-center justify-center h-9 px-4 border border-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-900 transition-colors"
          >
            Editar
          </Link>
          <StatusSwitch organizationId={org.id} currentStatus={org.status} />
        </div>
      </div>

      {/* Tabs (static — Fase 5 full implementation) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Datos del Centro */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
          <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
            🏢 Datos del Centro
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-xs text-zinc-500">Nombre Titular</p>
                <p className="font-medium text-zinc-300 mt-0.5">
                  {org.ownerName || org.ownerLastName ? `${org.ownerName || ""} ${org.ownerLastName || ""}`.trim() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">RUT</p>
                <p className="font-medium text-zinc-300 mt-0.5">{org.ownerRut || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-zinc-500">Email Contacto</p>
                <p className="font-medium text-zinc-300 mt-0.5 truncate">{org.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Teléfono</p>
                <p className="font-medium text-zinc-300 mt-0.5">{org.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Tipo / Registro</p>
                <p className="font-medium text-zinc-300 mt-0.5">
                  {org.orgType} <span className="text-zinc-600 font-normal">| {new Date(org.createdAt).toLocaleDateString("es-CL")}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan SaaS y Uso */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
          <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
            💼 Plan SaaS y Uso
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Plan Actual</p>
                <p className="font-medium text-sm text-zinc-200">{org.plan?.name || "Sin plan asignado"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-0.5">Ciclo</p>
                <p className="font-medium text-sm text-zinc-200">Ciclo {org.billingCycle || "A"}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Alumnos</span>
                <span className="font-medium text-zinc-300">
                  {activeStudents} / {org.overrideMaxActiveStudents ?? org.saasPlanLimit ?? org.plan?.maxActiveStudents ?? "∞"}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (org.overrideMaxActiveStudents ?? org.saasPlanLimit ?? org.plan?.maxActiveStudents ?? 0) > 0 && 
                    (activeStudents / (org.overrideMaxActiveStudents ?? org.saasPlanLimit ?? org.plan?.maxActiveStudents ?? 1)) * 100 > 90 
                      ? "bg-red-500" 
                      : "bg-indigo-500"
                  }`}
                  style={{ width: `${Math.min(((org.overrideMaxActiveStudents ?? org.saasPlanLimit ?? org.plan?.maxActiveStudents ?? 0) > 0 ? (activeStudents / (org.overrideMaxActiveStudents ?? org.saasPlanLimit ?? org.plan?.maxActiveStudents ?? 1)) * 100 : 0), 100)}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500">
                {(org.overrideMaxActiveStudents ?? org.saasPlanLimit ?? org.plan?.maxActiveStudents ?? 0) > 0
                  ? `${Math.round((activeStudents / (org.overrideMaxActiveStudents ?? org.saasPlanLimit ?? org.plan?.maxActiveStudents ?? 1)) * 100)}% del límite del plan`
                  : "Sin límite configurado"}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/50 space-y-2">
              <p className="text-xs text-zinc-400">
                Período actual hasta:{" "}
                <span className="font-medium text-zinc-300">
                  {org.billingPeriodEnd ? new Date(org.billingPeriodEnd).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }) : "—"}
                </span>
              </p>
              <p className="text-xs text-zinc-400">
                Cuentas creadas (histórico):{" "}
                <span className="font-medium text-zinc-300">{org._count.members}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Eventos */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
            📋 Eventos recientes
          </div>
          <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto">
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
          <BrandingUploader orgId={org.id} initialIconUrl={org.customIconUrl} orgUpdatedAt={org.updatedAt} />
        </TabsContent>

        <TabsContent value="importar" className="mt-6">
          <CsvImporter orgId={org.id} managerRole={manager.role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
