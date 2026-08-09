import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

import { prisma } from "../lib/prisma";

async function runSmokeTest() {
  console.log("--- Iniciando HTTP Smoke Test Cross-Tenant ---");

  // 1. Conseguir credenciales de ambos admins
  const adminBSFitEmail = "mpfbup@gmail.com"; 
  const adminCentro1Email = "mpfbup+centro1@gmail.com";
  
  const passwordAdmin = process.env.DEFAULT_PASSWORD_ADMIN || "Admin123!";

  console.log("Logueando como Admin de BSFit...");
  const { data: authBSFit, error: errBSFit } = await supabase.auth.signInWithPassword({
    email: adminBSFitEmail,
    password: passwordAdmin,
  });
  if (errBSFit) throw new Error(`Fallo auth BSFit: ${errBSFit.message}`);
  const tokenBSFit = authBSFit.session?.access_token;

  console.log("Logueando como Admin de Centro 1...");
  const { data: authCentro1, error: errCentro1 } = await supabase.auth.signInWithPassword({
    email: adminCentro1Email,
    password: process.env.DEFAULT_PASSWORD_ADMIN || "C4nt3r4D781", // Intentar ambas contraseñas por si acaso
  });
  if (errCentro1) throw new Error(`Fallo auth Centro 1: ${errCentro1.message}`);
  const tokenCentro1 = authCentro1.session?.access_token;

  // 2. Crear una Disciplina de prueba directo en BD para Centro 1
  console.log("\nCreando disciplina de prueba en Centro 1...");
  const orgCentro1 = await prisma.organization.findUnique({ where: { slug: "centro1" } });
  if (!orgCentro1) throw new Error("No se encontró la organización Centro 1");

  const discipline = await prisma.discipline.create({
    data: {
      organizationId: orgCentro1.id,
      name: "Disciplina Secreta de Centro 1",
      description: "Nadie de BSFit debería poder tocar esto",
      capacity: 10,
      durationMinutes: 60,
    }
  });

  console.log(`✅ Disciplina creada con ID: ${discipline.id}`);

  // 3. Intento malicioso: Admin BSFit intenta modificar la disciplina de Centro 1
  console.log("\n😈 INTENTO CROSS-TENANT: Admin de BSFit enviando PUT /api/disciplines/[id]...");
  
  // Asumimos que el backend está corriendo en http://localhost:3000
  const apiUrl = `http://localhost:3000/api/disciplines/${discipline.id}`;
  
  const putResponse = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenBSFit}` // Token del "atacante"
    },
    body: JSON.stringify({
      name: "Disciplina HACKEADA por BSFit",
      capacity: 999
    })
  });

  const putBody = await putResponse.json();

  console.log(`Status HTTP resultante: ${putResponse.status}`);
  console.log(`Respuesta del servidor:`, putBody);

  // 4. Verificación
  if (putResponse.status === 404) {
    console.log("\n✅ ÉXITO: El sistema devolvió 404 Not Found. El aislamiento de tenants FUNCIONA.");
  } else if (putResponse.status === 200) {
    console.log("\n❌ FALLO CRÍTICO: El servidor devolvió 200 OK. La disciplina fue secuestrada.");
  } else {
    console.log(`\n⚠️ RESULTADO INESPERADO: El servidor devolvió ${putResponse.status}. Revisar lógica.`);
  }

  // 5. Limpieza
  console.log("\nLimpiando datos de prueba...");
  await prisma.discipline.delete({ where: { id: discipline.id } });
  
  console.log("Test completado.");
}

runSmokeTest().catch(console.error).finally(() => prisma.$disconnect());
