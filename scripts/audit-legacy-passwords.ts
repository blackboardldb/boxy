import { createAdminClient } from "../lib/supabase/admin";
import { prisma } from "../lib/prisma";
import fs from "fs";

/**
 * Auditoría de Contraseñas Legacy (blacksheep26)
 *
 * Propósito:
 * Identificar usuarios ALUMNO que aún mantienen la contraseña hardcodeada asignada
 * por el script obsoleto `sync-auth-users.ts` (activo entre marzo y junio de 2026).
 *
 * Precauciones Operacionales implementadas:
 * 1. Alcance acotado: solo alumnos (role: ALUMNO) — el script legacy nunca asignó
 *    esa clave a admins o coaches.
 * 2. Secuencial: No usa Promise.all, procesa un usuario a la vez.
 * 3. Delay: Espera 500ms entre intentos para no detonar rate-limiting de Supabase Auth.
 * 4. signOut inmediato: cierra cada sesión creada en el match para no dejar tokens
 *    fantasma ni contaminar `last_sign_in_at` de la siguiente petición.
 *
 * Output:
 * - `compromised-accounts.csv` (ignorado por .gitignore — eliminar tras remediar).
 *
 * Ejecución:
 *   ENCRYPTION_KEY="..." npx tsx --env-file=.env scripts/audit-legacy-passwords.ts
 */

const DELAY_MS = 500;
const LEGACY_PASSWORD = "blacksheep26";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log("Iniciando auditoría de cuentas legacy (solo rol ALUMNO)...");
  const supabase = createAdminClient();

  // 1. Solo alumnos — el script obsoleto nunca asignó blacksheep26 a otros roles.
  const users = await prisma.user.findMany({
    where: { memberships: { some: { role: "ALUMNO" } } },
    select: { id: true, email: true },
  });

  console.log(`Se auditarán ${users.length} usuarios con rol ALUMNO.`);

  const compromisedEmails: string[] = [];
  const outputFile = "compromised-accounts.csv";

  fs.writeFileSync(outputFile, "user_id,email\n");

  let count = 0;
  for (const user of users) {
    if (!user.email) continue;

    count++;
    process.stdout.write(`Auditando [${count}/${users.length}]: ${user.email}... `);

    try {
      // 2. Intento de login con la clave legacy
      const { data } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: LEGACY_PASSWORD,
      });

      if (data?.session) {
        // MATCH: contraseña legacy confirmada
        console.log("⚠️  ¡EXPUESTO!");
        compromisedEmails.push(user.email);
        fs.appendFileSync(outputFile, `${user.id},${user.email}\n`);

        // 3. Cerrar sesión inmediatamente — evita tokens fantasma y contaminación
        //    de last_sign_in_at para auditorías futuras.
        await supabase.auth.signOut();
      } else {
        console.log("Seguro.");
      }
    } catch {
      console.log("Error de conexión, saltando.");
    }

    // 4. Delay para no detonar rate-limiting
    await delay(DELAY_MS);
  }

  console.log("\nAuditoría completada.");
  console.log(`Total expuestos: ${compromisedEmails.length}`);

  if (compromisedEmails.length > 0) {
    console.log(`⚠️  Resultados en ${outputFile} — eliminar tras remediar.`);
  } else {
    console.log("Sin cuentas expuestas. No se generó output con datos sensibles.");
    // Limpiar el archivo vacío si no hay hits
    fs.unlinkSync(outputFile);
  }
}

runAudit()
  .catch(console.error)
  .finally(() => process.exit(0));
