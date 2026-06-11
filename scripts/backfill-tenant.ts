/**
 * scripts/backfill-tenant.ts
 *
 * Script de backfill para asignar organizationId a todos los registros
 * que aún no tienen uno (MembershipPlan, Instructor, MembershipRenewal, PushSubscription).
 *
 * Uso:
 *   npx tsx scripts/backfill-tenant.ts
 *
 * IMPORTANTE: Ejecutar ANTES de correr "prisma migrate deploy" en producción
 * cuando se agrega organizationId NOT NULL a estas tablas.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Obtener la organización principal (debe existir exactamente una en este momento)
  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    throw new Error(
      "No se encontró ninguna organización. Crea al menos una antes de ejecutar este script."
    );
  }

  console.log(`\n✅ Organización objetivo: "${org.name}" (${org.id})\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MembershipPlan — asignar organizationId donde esté vacío (db push pone "" en NOT NULL)
  // ─────────────────────────────────────────────────────────────────────────────
  const plansUpdated = await prisma.membershipPlan.updateMany({
    where: { organizationId: "" },
    data: { organizationId: org.id },
  });
  console.log(`📋 MembershipPlan actualizados: ${plansUpdated.count}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Instructor — asignar organizationId donde esté vacío
  // ─────────────────────────────────────────────────────────────────────────────
  const instructorsUpdated = await prisma.instructor.updateMany({
    where: { organizationId: "" },
    data: { organizationId: org.id },
  });
  console.log(`👤 Instructor actualizados: ${instructorsUpdated.count}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. MembershipRenewal — asignar organizationId donde esté vacío
  // ─────────────────────────────────────────────────────────────────────────────
  const renewalsUpdated = await prisma.membershipRenewal.updateMany({
    where: { organizationId: "" },
    data: { organizationId: org.id },
  });
  console.log(`🔄 MembershipRenewal actualizados: ${renewalsUpdated.count}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. PushSubscription — asignar organizationId donde esté vacío
  // ─────────────────────────────────────────────────────────────────────────────
  const pushUpdated = await prisma.pushSubscription.updateMany({
    where: { organizationId: "" },
    data: { organizationId: org.id },
  });
  console.log(`🔔 PushSubscription actualizados: ${pushUpdated.count}`);

  console.log("\n✅ Backfill completado exitosamente.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en backfill:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
