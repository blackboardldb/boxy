import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.classRegistration.count();
  console.log(`Total registrations: ${total}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
