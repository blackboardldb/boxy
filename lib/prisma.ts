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

  // Limpiamos el flag pgbouncer de la URL porque ahora usamos el driver nativo pg.
  // Esto evita que Prisma inyecte BEGIN/DEALLOCATE ALL innecesarios.
  const connectionUrl = new URL(process.env.DATABASE_URL);
  connectionUrl.searchParams.delete("pgbouncer");

  // En serverless (Vercel), cada lambda levanta su propio Node process.
  // Mantenemos max: 2 para no agotar las conexiones del pooler de Supabase.
  const pool = new Pool({
    connectionString: connectionUrl.toString(),
    max: 2,
  });
  
  const adapter = new PrismaPg(pool);

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma;
