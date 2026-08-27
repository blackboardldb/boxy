/**
 * reconcile-auth-prisma.ts
 *
 * Script de auditoría (solo lectura) — identifica "huérfanos" en Supabase Auth.
 * Busca UUIDs que existen en Auth pero no tienen un registro correspondiente en Prisma,
 * lo cual indica que hubo un fallo en el rollback durante la creación de un alumno
 * (ej. error de base de datos luego de crear la cuenta en Supabase).
 *
 * Uso:
 *   npx tsx scripts/reconcile-auth-prisma.ts
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function run() {
  const supabase = createAdminClient();

  console.log("1. Obteniendo todos los usuarios de Supabase Auth...");
  const authUsers = new Map<string, { email?: string; created_at: string }>();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    if (!data?.users?.length) break;

    for (const u of data.users) {
      authUsers.set(u.id, { email: u.email, created_at: u.created_at });
    }

    if (data.users.length < 1000) break;
    page++;
  }
  console.log(`   Total en Supabase: ${authUsers.size}`);

  console.log("2. Obteniendo todos los authId de Prisma...");
  const prismaUsers = await prisma.user.findMany({
    where: { authId: { not: "" } }, // Para excluir posibles valores vacíos
    select: { authId: true },
  });

  const prismaAuthIds = new Set(prismaUsers.map((u) => u.authId));
  console.log(`   Total en Prisma: ${prismaAuthIds.size}`);

  console.log("3. Buscando huérfanos en Supabase...");
  const orphans = [];

  for (const [id, meta] of authUsers.entries()) {
    if (!prismaAuthIds.has(id)) {
      orphans.push({ id, ...meta });
    }
  }

  if (orphans.length === 0) {
    console.log("\n✅ No se encontraron usuarios huérfanos en Supabase.");
  } else {
    console.warn(`\n⚠️  Se encontraron ${orphans.length} usuarios huérfanos en Supabase:\n`);
    orphans.forEach((o, i) => {
      console.log(`  ${i + 1}. UUID: ${o.id} | Email: ${o.email} | Creado: ${o.created_at}`);
    });
    console.log("\nAcción recomendada: Verificar manualmente estos UUIDs en el dashboard de Supabase y eliminarlos si corresponde (fallos de rollback).");
  }

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
