import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida. Revisar .env");
  }

  if (process.env.NODE_ENV === "development") {
    // Profiler de memoria general para confirmar si el motor nativo resuelve el leak o si la fuga viene de otro lado (ej. Next.js HMR)
    setInterval(() => {
      const mem = process.memoryUsage();
      console.log(`[heap] rss=${(mem.rss/1024/1024).toFixed(0)}MB heapUsed=${(mem.heapUsed/1024/1024).toFixed(0)}MB`);
    }, 60000).unref();

    // Volvemos al motor nativo de Prisma (Rust) exclusivamente para local dev.
    // Hipótesis a verificar: El driver adapter en combinación con HMR/Polling causa un Memory Leak.
    // Hecho comprobado: Con el adapter activo, el heap sube ~1GB en 4 minutos en reposo.
    globalForPrisma.prisma = new PrismaClient({
      transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
      },
      log: ["error", "warn"],
    });
  } else {
    // PRODUCCIÓN (Serverless):
    // Aquí sí usamos el pooler y el adapter para evitar latencias de DEALLOCATE ALL
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    // CRÍTICO: Handler de error para el pool en producción
    pool.on("error", (err) => {
      console.error("Error inesperado en cliente inactivo de pg.Pool", err);
    });
    
    const adapter = new PrismaPg(pool);

    globalForPrisma.prisma = new PrismaClient({
      adapter,
      transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
      },
      log: ["error"],
    });
  }
}

export const prisma = globalForPrisma.prisma;
