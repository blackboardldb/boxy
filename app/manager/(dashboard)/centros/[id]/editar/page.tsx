import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditCenterForm } from "../../components/edit-center-form";

export default async function EditarCentroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManager();
  const { id } = await params;
  const org = await managerService.getById(id);
  if (!org) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href={`/manager/centros/${id}`}
          className="text-zinc-500 text-sm hover:text-white transition-colors"
        >
          ← Volver al detalle
        </Link>
        <h1 className="text-2xl font-bold mt-2">Editar {org.name}</h1>
        <p className="text-zinc-500 font-mono text-sm">{org.slug} · {org.id}</p>
      </div>
      <EditCenterForm org={org} />
    </div>
  );
}
