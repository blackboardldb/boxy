/**
 * create-auth-for-existing-users.ts
 *
 * Script de ejecución ÚNICA — crea cuentas en Supabase Auth para todos los
 * usuarios activos de Prisma que no tienen authId (y por ende no pueden hacer login).
 *
 * Comportamiento:
 *   - Carga TODOS los usuarios de Auth una sola vez (con paginación) al inicio.
 *   - Si el usuario ya existe en Auth, vincula el UUID existente — no lo recrea.
 *   - Si la creación falla por otro motivo, loggea y sigue (no aborta el loop).
 *   - Idempotente: solo procesa usuarios con authId: null.
 *
 * Uso:
 *   npx tsx scripts/create-auth-for-existing-users.ts
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { decryptPassword } from "../lib/utils/encryption";

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



/** Carga todos los usuarios de Supabase Auth con paginación, retorna mapa email→id */
async function buildAuthUserMap(supabase: ReturnType<typeof createAdminClient>): Promise<Map<string, string>> {
  const map = new Map<string, string>(); // email (lowercase) → authId UUID
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    if (!data?.users?.length) break;

    for (const u of data.users) {
      if (u.email) map.set(u.email.toLowerCase(), u.id);
    }

    if (data.users.length < 1000) break; // última página
    page++;
  }

  console.log(`Usuarios cargados desde Supabase Auth: ${map.size}`);
  return map;
}

async function run() {


  const supabase = createAdminClient();

  // 1. Cargar mapa de Auth en memoria (una sola vez)
  const authMap = await buildAuthUserMap(supabase);

  // 2. Traer todos los activos sin authId válido desde Prisma (tienen "dummyX")
  const users = await prisma.user.findMany({
    where: { deletedAt: null, authId: { startsWith: "dummy" } },
    select: { 
      id: true, 
      email: true, 
      firstName: true, 
      lastName: true,
      memberships: { select: { organizationId: true } }
    },
    orderBy: { email: "asc" },
  });

  console.log(`Usuarios activos con authId 'dummy' en Prisma: ${users.length}\n`);

  let creados = 0;
  let vinculados = 0;
  let errores = 0;

  for (const user of users) {
    const emailLower = user.email.toLowerCase();

    // ¿Ya existe en Auth? → vincular directamente sin crear
    const existingAuthId = authMap.get(emailLower);
    if (existingAuthId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { authId: existingAuthId },
      });
      console.log(`🔗 YA EXISTÍA  ${user.email} → ${existingAuthId}`);
      vinculados++;
      continue;
    }

    // Resolver password del tenant
    if (user.memberships.length === 0) {
      console.log(`⏭️  SKIP         ${user.email} — sin centro asignado, no se puede determinar la contraseña.`);
      errores++;
      continue;
    }

    if (user.memberships.length > 1) {
      console.warn(`⚠️  MÚLTIPLES   ${user.email} — pertenece a ${user.memberships.length} centros. Usando la contraseña del centro ${user.memberships[0].organizationId}. Verificar manualmente.`);
    }

    const orgId = user.memberships[0].organizationId;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { defaultStudentPassword: true }
    });

    if (!org || !org.defaultStudentPassword) {
      console.log(`⏭️  SKIP         ${user.email} — el centro ${orgId} no tiene defaultStudentPassword configurada.`);
      errores++;
      continue;
    }

    let password = "";
    try {
      password = decryptPassword(org.defaultStudentPassword);
      if (password.startsWith("Error")) throw new Error(password);
    } catch (e) {
      console.error(`❌ ERROR      ${user.email} — Error al desencriptar password del centro ${orgId}.`);
      errores++;
      continue;
    }

    // No existe → crear cuenta nueva en Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: emailLower,
      password: password,
      email_confirm: true,
      user_metadata: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: "alumno",
      },
    });

    if (error) {
      console.error(`❌ ERROR      ${user.email} — ${error.message}`);
      errores++;
      continue;
    }

    // Persistir authId en Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { authId: data.user.id },
    });

    console.log(`✅ CREADO      ${user.email} → ${data.user.id}`);
    creados++;
  }

  // ── Resumen ──────────────────────────────────────────────────────────────
  console.log(`\n── Resumen ──────────────────────────────`);
  console.log(`Cuentas nuevas creadas:   ${creados}`);
  console.log(`Ya existían (vinculadas): ${vinculados}`);
  console.log(`Errores:                  ${errores}`);

  // ── Verificación final ────────────────────────────────────────────────────
  const sinAuthIdActivos = await prisma.user.count({
    where: { authId: { startsWith: "dummy" }, deletedAt: null },
  });

  console.log(`\n── Verificación ─────────────────────────`);
  console.log(`Usuarios activos con authId 'dummy': ${sinAuthIdActivos}`);

  if (sinAuthIdActivos > 0) {
    console.warn(`\n⚠️  Aún hay ${sinAuthIdActivos} usuarios activos con authId dummy. Revisar los skips o errores arriba.`);
    await prisma.$disconnect();
    process.exit(1);
  } else {
    console.log(`\n✅ Todos los usuarios activos tienen authId. Backfill completo.`);
  }

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
