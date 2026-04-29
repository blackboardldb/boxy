
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const disciplineId = 'disc_custom_event';
  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
  });

  if (discipline) {
    console.log(`Discipline \${disciplineId} found:`, discipline);
  } else {
    console.log(`Discipline \${disciplineId} NOT found.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
