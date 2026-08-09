import { PrismaClient } from '@prisma/client';

import { prisma } from "./lib/prisma";

async function main() {
  const orgs = await prisma.organization.findMany();
  console.dir(orgs, { depth: null });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
