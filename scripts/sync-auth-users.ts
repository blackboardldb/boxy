/**
 * sync-auth-users.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Sincroniza todos los usuarios e instructores de Prisma con Supabase Auth.
 *
 * Reglas:
 *  ALUMNOS (public.users con role ≠ "admin")
 *    - Si ya existe en Auth  → actualiza contraseña a blacksheep26
 *    - Si no existe en Auth  → crea con contraseña blacksheep26
 *
 *  INSTRUCTORES (public.instructors)
 *    - Si ya existe en Auth  → omite (no toca su contraseña)
 *    - Si no existe en Auth  → crea con BsC04Ch@  (coach) o BsC04Ch@ (admin)
 *
 *  ADMIN ACTUAL (b.sheep.la@gmail.com u cualquier alumno con role="admin")
 *    → Siempre omitido, contraseña intacta.
 *
 * Uso:
 *   pnpm sync:auth
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY       = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const PASS_ALUMNO       = "blacksheep26";
const PASS_COACH        = "BsC04Ch@";

// Emails que NUNCA se tocan (admin del sistema)
const PROTECTED_EMAILS  = new Set(["b.sheep.la@gmail.com"]);

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Devuelve un Map email → auth_user_id con TODOS los usuarios en auth.users */
async function getAuthUserMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) { console.error("❌  listUsers:", error.message); process.exit(1); }
    for (const u of data.users) {
      if (u.email) map.set(u.email.toLowerCase(), u.id);
    }
    if (data.users.length < 1000) break;
    page++;
  }

  return map;
}

/** Crea un usuario en Auth + profile */
async function createAuthUser(
  email: string,
  password: string,
  role: string,
  firstName: string,
  lastName: string
): Promise<"created" | "error"> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { firstName, lastName, role },
  });

  if (error) {
    console.error(`  ⚠️  Error creando ${email}:`, error.message);
    return "error";
  }



  return "created";
}

/** Actualiza la contraseña de un usuario ya existente en Auth */
async function updateAuthPassword(
  authUserId: string,
  email: string,
  password: string
): Promise<"updated" | "error"> {
  const { error } = await supabase.auth.admin.updateUserById(authUserId, { password });

  if (error) {
    console.error(`  ⚠️  Error actualizando contraseña de ${email}:`, error.message);
    return "error";
  }

  return "updated";
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔄  Sincronización Auth ↔ Prisma\n" + "─".repeat(55));

  const authMap = await getAuthUserMap();
  console.log(`ℹ️   Usuarios en Supabase Auth: ${authMap.size}\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // ALUMNOS
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`📋  ALUMNOS → contraseña por defecto: "${PASS_ALUMNO}"\n`);

  const allUsers = await prisma.user.findMany({
    select: { email: true, firstName: true, lastName: true, memberships: { select: { role: true }, take: 1 } },
  });

  let uCreated = 0, uUpdated = 0, uSkipped = 0, uError = 0;

  for (const user of allUsers) {
    const email = user.email.toLowerCase();

    // Nunca tocar al admin del sistema
    if (PROTECTED_EMAILS.has(email) || user.memberships?.[0]?.role?.toLowerCase() === "admin") {
      console.log(`  🔒  ${email} — admin protegido, se omite`);
      uSkipped++;
      continue;
    }

    const authId = authMap.get(email);

    if (authId) {
      // Ya existe → actualizar contraseña
      const r = await updateAuthPassword(authId, email, PASS_ALUMNO);
      if (r === "updated") {
        console.log(`  🔑  ${email} — contraseña actualizada a "${PASS_ALUMNO}"`);
        uUpdated++;
      } else {
        uError++;
      }
    } else {
      // No existe → crear
      const r = await createAuthUser(email, PASS_ALUMNO, "alumno", user.firstName, user.lastName);
      if (r === "created") {
        console.log(`  ✅  ${email} — creado con "${PASS_ALUMNO}"`);
        uCreated++;
        authMap.set(email, "new"); // marcar para evitar duplicados
      } else {
        uError++;
      }
    }
  }

  console.log(`\n   Creados: ${uCreated} | Actualizados: ${uUpdated} | Protegidos: ${uSkipped} | Errores: ${uError}\n`);

  // ──────────────────────────────────────────────────────────────────────────
  // INSTRUCTORES
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`📋  INSTRUCTORES → contraseña por defecto: "${PASS_COACH}"\n`);

  const allInstructors = await prisma.instructor.findMany({
    select: { email: true, firstName: true, lastName: true, role: true },
  });

  let iCreated = 0, iSkipped = 0, iError = 0;

  for (const inst of allInstructors) {
    const email = inst.email.toLowerCase();

    if (PROTECTED_EMAILS.has(email)) {
      console.log(`  🔒  ${email} — admin protegido, se omite`);
      iSkipped++;
      continue;
    }

    if (authMap.has(email)) {
      // Ya existe → no tocar su contraseña
      console.log(`  ⏭️   ${email} — ya existe en Auth, se omite`);
      iSkipped++;
      continue;
    }

    const role = inst.role === "admin" ? "admin" : "coach";
    const r = await createAuthUser(email, PASS_COACH, role, inst.firstName, inst.lastName);
    if (r === "created") {
      console.log(`  ✅  ${email} — creado (${role} / "${PASS_COACH}")`);
      iCreated++;
      authMap.set(email, "new");
    } else {
      iError++;
    }
  }

  console.log(`\n   Creados: ${iCreated} | Omitidos: ${iSkipped} | Errores: ${iError}`);

  // ──────────────────────────────────────────────────────────────────────────
  // RESUMEN
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(55));
  console.log(`✅  Sincronización completa`);
  console.log(`   Alumnos creados:      ${uCreated}`);
  console.log(`   Alumnos actualizados: ${uUpdated}`);
  console.log(`   Protegidos/omitidos:  ${uSkipped + iSkipped}`);
  console.log(`   Instructores creados: ${iCreated}`);
  console.log(`   Errores:              ${uError + iError}`);
  console.log("─".repeat(55) + "\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌  Error inesperado:", e);
  prisma.$disconnect();
  process.exit(1);
});
