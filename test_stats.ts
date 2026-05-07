import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  const start = Date.now()
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const baseWhere = { organizationId: 'org_blacksheep_001' }

  console.time('Queries')
  const [
    totalMembers,
    pendingMembers,
    scheduledMembers,
    activeMembers,
    newThisMonth,
    revenueResult,
  ] = await Promise.all([
    prisma.userMembership.count({ where: baseWhere }),
    prisma.userMembership.count({ where: { ...baseWhere, status: "pending" } }),
    prisma.userMembership.count({ where: { ...baseWhere, status: "active", currentPeriodStart: { gt: today } } }),
    prisma.userMembership.count({ where: { ...baseWhere, status: "active", currentPeriodStart: { lte: today }, currentPeriodEnd:   { gte: today } } }),
    prisma.userMembership.count({ where: { ...baseWhere, startDate: { gte: firstOfMonth } } }),
    prisma.userMembership.aggregate({ where: { ...baseWhere, status: "active", currentPeriodStart: { gte: firstOfMonth, lte: today } }, _sum: { monthlyPrice: true } }),
  ])
  console.timeEnd('Queries')
  console.log('Total queries took:', Date.now() - start)

  console.time('Raw')
  // Try raw query
  const raw = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as "total",
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as "pending",
      SUM(CASE WHEN status = 'active' AND "currentPeriodStart" > ${today} THEN 1 ELSE 0 END) as "scheduled",
      SUM(CASE WHEN status = 'active' AND "currentPeriodStart" <= ${today} AND "currentPeriodEnd" >= ${today} THEN 1 ELSE 0 END) as "active",
      SUM(CASE WHEN "startDate" >= ${firstOfMonth} THEN 1 ELSE 0 END) as "new",
      SUM(CASE WHEN status = 'active' AND "currentPeriodStart" >= ${firstOfMonth} AND "currentPeriodStart" <= ${today} THEN "monthlyPrice" ELSE 0 END) as "revenue"
    FROM "user_memberships"
    WHERE "organizationId" = 'org_blacksheep_001'
  `
  console.timeEnd('Raw')

  console.log(raw)
}
test()
