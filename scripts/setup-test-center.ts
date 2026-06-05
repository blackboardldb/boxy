import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const CENTER_EMAIL = "mpfbup@gmail.com";
const STUDENT_EMAIL = "mpf.bup@gmail.com";
const CENTER_NAME = "bsfit";
const CENTER_SLUG = "bsfit";

const ADMIN_PASSWORD = process.env.DEFAULT_PASSWORD_ADMIN!;
const ALUMNO_PASSWORD = process.env.DEFAULT_PASSWORD_ALUMNO!;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey || !ADMIN_PASSWORD || !ALUMNO_PASSWORD) {
  console.error("❌ Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();

async function createAuthUser(email: string, password: string, role: string) {
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingUser = listData?.users?.find((u) => u.email === email);

  if (existingUser) {
    console.log(`ℹ️  Usuario ya existe en Supabase Auth: ${email} (id: ${existingUser.id})`);
    
    // Forzar actualización de contraseña y metadata
    await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      app_metadata: { role }
    });
    
    return existingUser.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  });

  if (error || !data.user) {
    console.error(`❌ Error creando usuario ${email} en Supabase Auth:`, error?.message);
    process.exit(1);
  }

  console.log(`✅ Usuario creado en Supabase Auth: ${email} (id: ${data.user.id})`);
  return data.user.id;
}

async function main() {
  console.log(`\n🚀 Iniciando setup del centro de pruebas: ${CENTER_NAME}...\n`);

  // 1. Crear Organización en Prisma
  let org = await prisma.organization.findUnique({ where: { slug: CENTER_SLUG } });
  if (org) {
    console.log(`ℹ️  La organización '${CENTER_NAME}' ya existe (id: ${org.id})`);
  } else {
    org = await prisma.organization.create({
      data: {
        name: CENTER_NAME,
        slug: CENTER_SLUG,
        status: "ACTIVE",
      },
    });
    console.log(`✅ Organización '${CENTER_NAME}' creada (id: ${org.id})`);
  }

  // 2. Crear Usuarios en Supabase Auth
  const adminAuthId = await createAuthUser(CENTER_EMAIL, ADMIN_PASSWORD, "ADMIN");
  const studentAuthId = await createAuthUser(STUDENT_EMAIL, ALUMNO_PASSWORD, "ALUMNO");

  // 3. Registrar o actualizar Usuarios en Prisma (Tabla public.users)
  // Admin User
  let adminUser = await prisma.user.findUnique({ where: { email: CENTER_EMAIL } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: CENTER_EMAIL,
        firstName: "Admin",
        lastName: "BSFit",
        authId: adminAuthId,
      }
    });
    console.log(`✅ Usuario Admin creado en BD: ${CENTER_EMAIL}`);
  } else {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { authId: adminAuthId }
    });
  }

  // Student User
  let studentUser = await prisma.user.findUnique({ where: { email: STUDENT_EMAIL } });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: STUDENT_EMAIL,
        firstName: "Sole",
        lastName: "Villarroel",
        authId: studentAuthId,
      }
    });
    console.log(`✅ Usuario Alumno creado en BD: ${STUDENT_EMAIL}`);
  } else {
    await prisma.user.update({
      where: { id: studentUser.id },
      data: { authId: studentAuthId }
    });
  }

  // 4. Vincular Usuarios al Centro (OrganizationMember)
  // Vincular Admin
  const existingAdminMember = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: adminUser.id, organizationId: org.id } }
  });
  if (!existingAdminMember) {
    await prisma.organizationMember.create({
      data: {
        userId: adminUser.id,
        organizationId: org.id,
        role: "ADMIN",
        status: "active"
      }
    });
    console.log(`✅ Admin vinculado al centro con rol ADMIN`);
  }

  // Vincular Alumno
  const existingStudentMember = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: studentUser.id, organizationId: org.id } }
  });
  if (!existingStudentMember) {
    await prisma.organizationMember.create({
      data: {
        userId: studentUser.id,
        organizationId: org.id,
        role: "ALUMNO",
        status: "active"
      }
    });
    console.log(`✅ Alumno vinculado al centro con rol ALUMNO`);
  }

  console.log("\n🎉 ¡Setup completado con éxito!\n");
  console.log("📊 DATOS DE ACCESO:");
  console.log("----------------------------------------");
  console.log(`🏢 Centro (Admin):`);
  console.log(`   URL:      http://${CENTER_SLUG}.localhost:3000/centro`);
  console.log(`   Email:    ${CENTER_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("----------------------------------------");
  console.log(`🏋️ Alumno:`);
  console.log(`   URL:      http://${CENTER_SLUG}.localhost:3000/alumnos`);
  console.log(`   Email:    ${STUDENT_EMAIL}`);
  console.log(`   Password: ${ALUMNO_PASSWORD}`);
  console.log("----------------------------------------\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
