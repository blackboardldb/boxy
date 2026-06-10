/**
 * scripts/fix-duplicate-renewals.ts
 *
 * Script de limpieza preventiva para registros MembershipRenewal duplicados.
 *
 * CUÁNDO EJECUTAR:
 *   Ejecutar SOLO si la DB tiene registros duplicados por (userId, organizationId, startDate).
 *   La DB de Boxy estaba limpia al momento de escribir este script (2026-06-10).
 *   Si llega a haber duplicados en producción (antes de que el bug esté en prod),
 *   ejecutar este script ANTES de aplicar cualquier constraint único en DB.
 *
 * QUÉ HACE:
 *   1. Detecta grupos de MembershipRenewal con status 'approved' que comparten
 *      (userId, organizationId, startDate) — clave de negocio de un período de plan.
 *   2. Para cada grupo, mantiene el registro más reciente (requestedAt DESC).
 *   3. Marca los demás como status: 'superseded'.
 *   4. Reporta cuántos registros fueron marcados, agrupados por organizationId.
 *
 * GARANTÍAS:
 *   - Filtra estrictamente por organizationId — nunca cruza datos entre centros.
 *   - No toca renewals con startDate IS NULL (tipo 'pending' o 'scheduled').
 *   - No toca renewals con status distinto de 'approved'.
 *   - Es idempotente: si se corre dos veces, el resultado es el mismo.
 *
 * USO:
 *   npx ts-node --project tsconfig.json scripts/fix-duplicate-renewals.ts
 *
 *   Para modo DRY RUN (solo reportar, sin escribir):
 *   DRY_RUN=true npx ts-node --project tsconfig.json scripts/fix-duplicate-renewals.ts
 */

import { prisma } from "@/lib/prisma";

const DRY_RUN = process.env.DRY_RUN === "true";

async function main() {
  console.log("=".repeat(60));
  console.log("Fix Duplicate MembershipRenewals");
  console.log(DRY_RUN ? "⚠️  DRY RUN — no se escribirá nada en DB" : "🔴  MODO REAL — escribiendo en DB");
  console.log("=".repeat(60));

  // Obtener todos los renewals aprobados con startDate definida
  const allApproved = await prisma.membershipRenewal.findMany({
    where: {
      status: "approved",
      startDate: { not: null },
    },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      startDate: true,
      requestedAt: true,
      amount: true,
    },
    orderBy: { requestedAt: "desc" },
  });

  console.log(`\nTotal renewals approved con startDate: ${allApproved.length}`);

  // Agrupar por (userId, organizationId, startDate)
  const groups = new Map<string, typeof allApproved>();

  for (const r of allApproved) {
    if (!r.startDate || !r.organizationId) continue;

    const dateKey = r.startDate.toISOString().split("T")[0];
    const key = `${r.userId}|${r.organizationId}|${dateKey}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  // Filtrar solo grupos con duplicados
  const duplicateGroups = Array.from(groups.entries()).filter(
    ([, records]) => records.length > 1
  );

  console.log(`Grupos con duplicados: ${duplicateGroups.length}`);

  if (duplicateGroups.length === 0) {
    console.log("\n✅ No se encontraron duplicados. DB limpia.");
    return;
  }

  // Reporte por organización
  const byOrg = new Map<string, number>();
  let totalToSupersede = 0;
  const idsToSupersede: string[] = [];

  for (const [key, records] of duplicateGroups) {
    // El primero (más reciente) se conserva; el resto se marca como superseded
    const [winner, ...losers] = records; // ya ordenados por requestedAt DESC
    const orgId = winner.organizationId ?? "unknown";

    console.log(`\n  Grupo: ${key}`);
    console.log(`    Mantener: ${winner.id} (${winner.requestedAt.toISOString()}, $${winner.amount ?? 0})`);

    for (const loser of losers) {
      console.log(`    Supersede: ${loser.id} (${loser.requestedAt.toISOString()}, $${loser.amount ?? 0})`);
      idsToSupersede.push(loser.id);
      byOrg.set(orgId, (byOrg.get(orgId) ?? 0) + 1);
      totalToSupersede++;
    }
  }

  console.log(`\nResumen por organización:`);
  for (const [orgId, count] of byOrg.entries()) {
    console.log(`  ${orgId}: ${count} registro(s) a marcar como superseded`);
  }

  console.log(`\nTotal a marcar como superseded: ${totalToSupersede}`);

  if (DRY_RUN) {
    console.log("\n⚠️  DRY RUN: no se realizaron cambios.");
    return;
  }

  // Aplicar
  const result = await prisma.membershipRenewal.updateMany({
    where: { id: { in: idsToSupersede } },
    data: { status: "superseded" },
  });

  console.log(`\n✅ ${result.count} registros marcados como 'superseded'.`);
  console.log("La DB queda sin duplicados en status 'approved'.");
}

main()
  .catch((err) => {
    console.error("❌ Error ejecutando fix-duplicate-renewals:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
