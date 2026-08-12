import { prisma } from "../lib/prisma";

async function main() {
  const CAPACITY = 3;
  const CONCURRENT_REQUESTS = 10;

  // 1. Setup: crear clase de prueba con capacity conocida
  const testClass = await prisma.classSession.findFirst({
    where: { capacity: CAPACITY },
    orderBy: { dateTime: "desc" },
  });
  if (!testClass) {
    console.error(`No se encontró ninguna clase con capacity=${CAPACITY}. Ajustar CAPACITY o crear una clase de prueba.`);
    process.exit(1);
  }

  // 2. Limpiar registros previos de prueba en esa clase
  await prisma.classRegistration.deleteMany({ where: { classId: testClass.id } });

  // 3. Traer N usuarios de prueba reales de la DB (ajustar filtro según tu seed)
  const testUsers = await prisma.user.findMany({ take: CONCURRENT_REQUESTS });
  if (testUsers.length < CONCURRENT_REQUESTS) {
    console.error(`Se necesitan al menos ${CONCURRENT_REQUESTS} usuarios en DB para el test.`);
    process.exit(1);
  }

  console.log(`Disparando ${CONCURRENT_REQUESTS} registros concurrentes contra clase capacity=${CAPACITY}...`);

  // 4. Import directo del servicio (no HTTP, para aislar la race condition del código)
  const { classService } = await import("../lib/services/class-service");

  const results = await Promise.allSettled(
    testUsers.map((u) => classService.registerStudent(testClass.id, u.id))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const rejected = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
  const failed = rejected.length;
  
  if (failed > 0) {
    console.log("Rejection examples:");
    rejected.slice(0, 3).forEach(r => console.log(r.reason));
  }

  const finalCount = await prisma.classRegistration.count({
    where: { classId: testClass.id, status: "registered" },
  });

  console.log(`Éxitos: ${succeeded} | Rechazados: ${failed}`);
  console.log(`Conteo final en DB: ${finalCount} | Capacity: ${CAPACITY}`);

  if (finalCount > CAPACITY) {
    console.error(`❌ FALLO: overbooking confirmado, ${finalCount} > ${CAPACITY}`);
    process.exit(1);
  } else {
    console.log(`✅ OK: no hubo overbooking.`);
  }

  // 5. Limpieza
  await prisma.classRegistration.deleteMany({ where: { classId: testClass.id } });
}

main().finally(() => prisma.$disconnect());
