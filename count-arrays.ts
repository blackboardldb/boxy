import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.classSession.count();
  const withRegistered = await prisma.classSession.count({
    where: { NOT: { registeredParticipantsIds: { isEmpty: true } } }
  });
  const withWaitlist = await prisma.classSession.count({
    where: { NOT: { waitlistParticipantsIds: { isEmpty: true } } }
  });
  
  console.log(`Total classes: ${total}`);
  console.log(`Classes with registeredParticipantsIds: ${withRegistered}`);
  console.log(`Classes with waitlistParticipantsIds: ${withWaitlist}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
