/**
 * Script one-shot: crea el usuario superadmin (manager) en Supabase Auth
 * y lo registra en la tabla ManagerUser de Postgres.
 *
 * Uso:
 *   pnpm exec tsx --env-file=.env scripts/create-manager.ts
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const MANAGER_EMAIL = "blackboard.ldb@gmail.com";
const MANAGER_PASSWORD = process.env.DEFAULT_PASSWORD_SUPERADMIN || process.env.DEFAULT_PASSWORD_ADMIN!;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey || !MANAGER_PASSWORD) {
  console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEFAULT_PASSWORD_SUPERADMIN");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();

async function main() {
  console.log(`\n🔐 Creando manager: ${MANAGER_EMAIL}\n`);

  // 1. Verificar si ya existe en Supabase Auth
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingUser = listData?.users?.find((u) => u.email === MANAGER_EMAIL);

  let authId: string;

  if (existingUser) {
    console.log(`ℹ️  Usuario ya existe en Supabase Auth (id: ${existingUser.id})`);
    authId = existingUser.id;

    // Actualizar contraseña para asegurarnos que es correcta y tiene claims de manager
    const { error: updateErr } = await supabase.auth.admin.updateUserById(authId, {
      password: MANAGER_PASSWORD,
      email_confirm: true,
      app_metadata: { isManager: true },
    });
    if (updateErr) {
      console.warn("⚠️  No se pudo actualizar la contraseña:", updateErr.message);
    } else {
      console.log("✅ Contraseña y claims actualizados correctamente");
    }
  } else {
    // Crear usuario nuevo en Supabase Auth con claims de manager
    const { data, error } = await supabase.auth.admin.createUser({
      email: MANAGER_EMAIL,
      password: MANAGER_PASSWORD,
      email_confirm: true,
      app_metadata: { isManager: true },
    });

    if (error || !data.user) {
      console.error("❌ Error creando usuario en Supabase Auth:", error?.message);
      process.exit(1);
    }

    authId = data.user.id;
    console.log(`✅ Usuario creado en Supabase Auth con claims (id: ${authId})`);
  }

  // 2. Verificar si ya existe en ManagerUser
  const existing = await prisma.managerUser.findUnique({ where: { authId } });

  if (existing) {
    console.log(`ℹ️  Ya existe en tabla ManagerUser (role: ${existing.role})`);
  } else {
    await prisma.managerUser.create({
      data: {
        authId,
        email: MANAGER_EMAIL,
        role: "OWNER",
      },
    });
    console.log(`✅ Registrado en tabla ManagerUser con role OWNER`);
  }

  console.log("\n🎉 Listo. Accede en:\n   http://localhost:3000/manager/login\n");
  console.log(`   Email:    ${MANAGER_EMAIL}`);
  console.log(`   Password: (DEFAULT_PASSWORD_SUPERADMIN del .env)\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
