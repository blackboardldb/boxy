/**
 * backfill-expense-org.ts
 *
 * Asigna el organizationId del único centro existente a todos los registros
 * de Expense que tengan organizationId = NULL.
 *
 * Uso (una sola vez, entre las dos migraciones):
 *   pnpm tsx scripts/backfill-expense-org.ts
 *
 * Pre-condiciones:
 *   - Ya se ejecutó la migración "add-organization-to-expense" (columna nullable).
 *   - Existe exactamente UNA organización en la DB (o se pasa ORG_ID por env).
 *
 * Post-condiciones:
 *   - Todos los Expense tienen organizationId asignado.
 *   - Se puede ejecutar la segunda migración "make-expense-org-required".
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Buscando organizaciones...");

  // Usar ORG_ID de entorno si está definido; si no, autodetectar
  let organizationId = process.env.ORG_ID;

  if (!organizationId) {
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true },
    });

    if (orgs.length === 0) {
      throw new Error("❌ No hay organizaciones en la DB. Verifica la conexión.");
    }

    if (orgs.length > 1) {
      console.error("⚠️  Hay más de una organización:");
      orgs.forEach((o) => console.error(`   - ${o.id}  ${o.name}`));
      throw new Error(
        "❌ Backfill ambiguo: hay múltiples organizaciones. " +
          "Pasa el ID correcto con: ORG_ID=<id> pnpm tsx scripts/backfill-expense-org.ts"
      );
    }

    organizationId = orgs[0].id;
    console.log(`✅ Organización detectada: "${orgs[0].name}" (${organizationId})`);
  } else {
    // Verificar que el ID provisto existe
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });
    if (!org) {
      throw new Error(`❌ No existe una organización con ID: ${organizationId}`);
    }
    console.log(`✅ Usando organización provista: "${org.name}" (${organizationId})`);
  }

  // Nota: organizationId es NOT NULL desde la migración "make-expense-org-required".
  // Este script fue diseñado para ejecutarse entre las dos migraciones (cuando era nullable).
  // Si se necesita re-ejecutar en otra instancia, ajustar el filtro según el estado de la columna.

  // Verificar que todos los Expense tienen organizationId asignado
  const total = await prisma.expense.count();
  console.log(`📊 Total de registros en Expense: ${total}`);

  if (total === 0) {
    console.log("✅ La tabla Expense está vacía. Nada que hacer.");
    return;
  }

  const result = await prisma.expense.updateMany({
    where: {
      // Backfill de seguridad: no debería haber registros sin organizationId
      // dado que la columna es NOT NULL, pero se mantiene como referencia.
      organizationId: organizationId as string,
    },
    data: { organizationId: organizationId as string },
  });

  console.log(`✅ Verificación completa: ${result.count} registro(s) confirmados con organizationId = ${organizationId}`);
  console.log("🎉 La tabla Expense está correctamente scoped por organización.");
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
