
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  try {
    const orgId = "org_blacksheep_001";
    console.log('Probando query de stats con organizationId:', orgId);
    
    // Si esta query falla, ya sabemos que el problema es el filtro JSON de Prisma
    const count = await (prisma as any).user.count({
      where: {
        role: "user",
        membership: { path: ["organizationId"], equals: orgId }
      }
    });
    
    console.log('✅ Query exitosa. Count:', count);
  } catch (err: any) {
    console.error('❌ Error detectado en la query:', err.message);
    if (err.message.includes("Unknown argument")) {
        console.error('Sugerencia: "path" no es reconocido. Quizás debas usar "equals" directo si es un campo simple.');
    }
  } finally {
    await prisma.$disconnect()
  }
}
test();
