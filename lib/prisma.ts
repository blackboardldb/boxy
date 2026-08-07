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

  // En serverless (Vercel), cada lambda levanta su propio Node process.
  // Mantenemos max: 2 para no agotar las conexiones del pooler de Supabase.
  // En local (development) permitimos más conexiones concurrentes porque hay un solo proceso de Node.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: process.env.NODE_ENV === "development" ? 15 : 2,
    idleTimeoutMillis: 30000,       // Cerrar conexiones inactivas a los 30s
    connectionTimeoutMillis: 10000, // No colgarse por siempre si la DB no responde
  });

  // CRÍTICO: Prevenir que errores en conexiones inactivas (ej. PgBouncer cerrándolas)
  // rompan el proceso silenciosamente o acumulen basura.
  pool.on("error", (err) => {
    console.error("Error inesperado en cliente inactivo de pg.Pool", err);
  });

  if (process.env.NODE_ENV === "development") {
    // Profiler de memoria para detectar fugas asociadas a la destrucción de conexiones en idleTimeout
    setInterval(() => {
      const mem = process.memoryUsage();
      console.log(`[heap] rss=${(mem.rss/1024/1024).toFixed(0)}MB heapUsed=${(mem.heapUsed/1024/1024).toFixed(0)}MB listeners_pool=${pool.listenerCount('error')}`);
    }, 60000).unref();
  }
  
  const adapter = new PrismaPg(pool);

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
    // QUITAMOS "query" de dev. El OOM de 4GB que vimos con 4 sesiones activas 
    // fue muy probablemente backpressure en el stdout de Node.js saturado por el log
    // infinito de queries de Prisma, no un memory leak oscuro del adapter Wasm.
    log: ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma;
