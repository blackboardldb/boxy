import { prisma } from "../lib/prisma";

async function main() {
  console.log("=== 1. Estado de los Planes (Plantillas) ===");
  const planes = await prisma.$queryRaw`
    SELECT id, name, "maxActiveStudents", "priceMonthly"
    FROM "plans"
    ORDER BY "createdAt" ASC;
  `;
  console.table(planes);

  console.log("\n=== 2. Estado de los Centros (Snapshots) ===");
  const centros = await prisma.$queryRaw`
    SELECT name, slug, "saasPlanId", "saasPlanLimit", "saasPlanPrice"
    FROM "organizations"
    WHERE "saasPlanId" IS NOT NULL
    ORDER BY "updatedAt" DESC
    LIMIT 5;
  `;
  console.table(centros);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
