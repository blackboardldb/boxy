import { PrismaClient } from '@prisma/client';

import { prisma } from "../lib/prisma";

async function runTest() {
  console.log('--- Iniciando Smoke Test de Aislamiento ---');

  // 1. Crear o recuperar 2 organizaciones
  let orgA = await prisma.organization.findFirst({ where: { slug: 'org-a-test' } });
  if (!orgA) {
    orgA = await prisma.organization.create({ data: { name: 'Org A (Test)', slug: 'org-a-test' } });
  }

  let orgB = await prisma.organization.findFirst({ where: { slug: 'org-b-test' } });
  if (!orgB) {
    orgB = await prisma.organization.create({ data: { name: 'Org B (Test)', slug: 'org-b-test' } });
  }

  // 2. Crear usuarios dummy
  let userA = await prisma.user.findFirst({ where: { email: 'usera@test.com' } });
  if (!userA) {
    userA = await prisma.user.create({ data: { email: 'usera@test.com', firstName: 'User', lastName: 'A', id: 'test-user-a', authId: 'test-auth-a' } });
  }

  let userB = await prisma.user.findFirst({ where: { email: 'userb@test.com' } });
  if (!userB) {
    userB = await prisma.user.create({ data: { email: 'userb@test.com', firstName: 'User', lastName: 'B', id: 'test-user-b', authId: 'test-auth-b' } });
  }

  // 3. Generar renewals (si no existen)
  await prisma.membershipRenewal.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });

  await prisma.membershipRenewal.create({
    data: {
      userId: userA.id,
      organizationId: orgA.id,
      status: 'pending'
    }
  });

  await prisma.membershipRenewal.create({
    data: {
      userId: userB.id,
      organizationId: orgB.id,
      status: 'pending'
    }
  });

  // 4. Test simulando la query del endpoint
  console.log('\nEjecutando query como Admin de Org A...');
  const renewalsA = await prisma.membershipRenewal.findMany({
    where: {
      status: 'pending',
      organizationId: orgA.id,
    }
  });

  console.log(`Resultados obtenidos para Org A: ${renewalsA.length}`);
  const allBelongToOrgA = renewalsA.every(r => r.organizationId === orgA.id);
  const noneBelongToOrgB = renewalsA.every(r => r.organizationId !== orgB.id);
  console.log(`¿Todos pertenecen a Org A y ninguno a B?: ${allBelongToOrgA && noneBelongToOrgB ? '✅ Sí' : '❌ No'}`);

  console.log('\nEjecutando query como Admin de Org B...');
  const renewalsB = await prisma.membershipRenewal.findMany({
    where: {
      status: 'pending',
      organizationId: orgB.id,
    }
  });

  console.log(`Resultados obtenidos para Org B: ${renewalsB.length}`);
  const allBelongToOrgB = renewalsB.every(r => r.organizationId === orgB.id);
  const noneBelongToOrgA = renewalsB.every(r => r.organizationId !== orgA.id);
  console.log(`¿Todos pertenecen a Org B y ninguno a A?: ${allBelongToOrgB && noneBelongToOrgA ? '✅ Sí' : '❌ No'}`);

  // Limpieza
  console.log('\nLimpiando datos de prueba...');
  await prisma.membershipRenewal.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });

  console.log('Test completado.');
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
