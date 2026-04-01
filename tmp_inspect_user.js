
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    where: {
      OR: [
        { firstName: { contains: 'Sebastian', mode: 'insensitive' } },
        { lastName: { contains: 'Fuentes', mode: 'insensitive' } },
        { id: 'user_032' }
      ]
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
