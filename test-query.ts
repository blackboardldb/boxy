import { prisma } from './lib/prisma';
async function test() {
  const org = await prisma.organization.findUnique({ where: { slug: 'bsfit' } });
  if (!org) throw new Error('not found');
  console.log(org.id);
  const row = await prisma.$queryRaw`
      WITH
        membership_counts AS (
          SELECT
            COUNT(u.id)                                                                  AS "totalMembers",
            SUM(CASE WHEN um.status = 'pending' THEN 1 ELSE 0 END)                       AS "pendingFromMemberships",
            SUM(CASE WHEN um.status = 'active' AND um."currentPeriodStart" > NOW()
                     THEN 1 ELSE 0 END)                                                  AS "scheduledMembers",
            SUM(CASE WHEN um.status = 'active'
                          AND um."currentPeriodStart" <= NOW()
                          AND um."currentPeriodEnd"   >= NOW()
                     THEN 1 ELSE 0 END)                                                  AS "activeMembers",
            SUM(CASE
                  WHEN um.status IS NULL THEN 1
                  WHEN um.status NOT IN ('active', 'pending') THEN 1
                  WHEN um.status = 'active' AND um."currentPeriodEnd" < NOW() THEN 1
                  ELSE 0
                END)                                                                     AS "inactiveMembers",
            SUM(CASE WHEN um."startDate" >= '2026-06-01' THEN 1 ELSE 0 END)           AS "newThisMonth"
          FROM "users" u
          LEFT JOIN "user_memberships" um ON um."userId" = u.id
          WHERE u."organizationId" = ${org.id}
            AND u."deletedAt" IS NULL
            AND u.role = 'user'
        )
      SELECT * FROM membership_counts;
  `;
  console.log(row);
}
test().catch(console.error);
