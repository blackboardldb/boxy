import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
  console.log("[PRISMA] CREATING NEW PRISMA CLIENT INSTANCE!");
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida. Revisar .env");
  }

  if (process.env.NODE_ENV === "development") {
    // Profiler de memoria general para confirmar si el motor nativo resuelve el leak o si la fuga viene de otro lado (ej. Next.js HMR)
    setInterval(() => {
      const mem = process.memoryUsage();
      console.log(`[heap] rss=${(mem.rss/1024/1024).toFixed(0)}MB heapUsed=${(mem.heapUsed/1024/1024).toFixed(0)}MB`);
    }, 5000).unref();

    // Volvemos al motor nativo de Prisma (Rust) exclusivamente para local dev.
    // Inyectamos connection_limit=10 explícitamente para mitigar los cuelgues (latencia extrema)
    // bajo estrés (como React Query haciendo polling desde múltiples pestañas).
    // NOTA: Esto NO resuelve el memory leak de heap subyacente (causa raíz aún sin identificar).
    const devUrl = new URL(process.env.DATABASE_URL);
    devUrl.searchParams.set("connection_limit", "10");
    devUrl.searchParams.set("pool_timeout", "20");

    globalForPrisma.prisma = new PrismaClient({
      datasourceUrl: devUrl.toString(),
      transactionOptions: {
        maxWait: 5000,
        timeout: 10000,
      },
      log: ["error", "warn"],
    });
  } else {
    const prodUrl = new URL(process.env.DATABASE_URL);
    
    // PRODUCCIÓN (Serverless):
    // Aquí sí usamos el pooler y el adapter para evitar latencias de DEALLOCATE ALL
    const pool = new Pool({
      connectionString: prodUrl.toString(),
      options: "-c search_path=auth,public", // CRÍTICO: Asegura que raw queries vean auth
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    // CRÍTICO: Handler de error para el pool en producción
    pool.on("error", (err) => {
      console.error("Error inesperado en cliente inactivo de pg.Pool", err);
    });
    
    // Mantenemos explícito el schema para el adapter
    const adapter = new PrismaPg(pool, { schema: "public,auth" });

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
