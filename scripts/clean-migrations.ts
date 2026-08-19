import { prisma } from "../lib/prisma";

async function main() {
  console.log("Limpiando 0_init para re-resolver checksum...");
  await prisma.$executeRawUnsafe(`DELETE FROM "public"."_prisma_migrations" WHERE "migration_name" = '0_init';`);
  console.log("Listo.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
