import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT 
      id, name, slug, status,
      email, phone, address,
      "ownerName", "ownerLastName", "ownerRut",
      "billingPlan", "billingPeriodEnd",
      "isActive"
    FROM organizations
    WHERE slug = 'bsfit';
  `;
  console.dir(result, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
