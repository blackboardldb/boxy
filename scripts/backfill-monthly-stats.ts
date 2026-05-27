import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function toDateString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value).split("T")[0];
}

async function main() {
  console.log("🚀 Iniciando script de backfill para user_monthly_stats en base a user_memberships...\n");

  // ─── 1. Copia de Seguridad Preventiva ──────────────────────────────────────
  let existingStats = [];
  try {
    existingStats = await prisma.$queryRaw<any[]>`SELECT * FROM "user_monthly_stats"`;
    console.log(`ℹ️ Registros actuales en user_monthly_stats: ${existingStats.length}`);
  } catch (err: any) {
    console.warn("⚠️ Advertencia leyendo user_monthly_stats (podría no existir aún):", err.message);
  }

  if (existingStats.length > 0) {
    const backupPath = path.join(process.cwd(), "scripts", `backup_monthly_stats_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(existingStats, null, 2), "utf8");
    console.log(`📦 Backup guardado exitosamente en: ${backupPath}\n`);
  } else {
    console.log("ℹ️ No hay registros previos que respaldar en user_monthly_stats.\n");
  }

  // ─── 2. Cargar todos los alumnos con su membresía activa y plan ──────────────
  const memberships = await prisma.userMembership.findMany({
    include: {
      plan: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  console.log(`👥 Membresías encontradas en la base de datos: ${memberships.length}`);

  let totalProcessed = 0;
  let totalInsertedOrUpdated = 0;

  for (const membership of memberships) {
    const { userId, startDate, currentPeriodStart, currentPeriodEnd, membershipType, classLimit, organizationId, plan, user } = membership;

    if (!startDate || !currentPeriodStart) {
      console.log(`⚠️ Alumno ${user.email} (ID: ${userId}) no tiene startDate o currentPeriodStart definidos. Se omite.`);
      continue;
    }

    console.log(`\n👤 Procesando alumno: ${user.email} (ID: ${userId})`);
    console.log(`   Membresía actual: ${membershipType} | Inicio: ${toDateString(startDate)} | Período actual: ${toDateString(currentPeriodStart)} al ${toDateString(currentPeriodEnd)}`);

    // Obtener todos los registros de clases asistidas (con estado 'registered') del alumno
    const registrations = await prisma.classRegistration.findMany({
      where: {
        userId,
        status: "registered",
        class: {
          dateTime: { lt: new Date() },
        },
      },
      select: {
        class: {
          select: {
            dateTime: true,
          },
        },
      },
    });

    // Duración del plan en meses (default 1)
    const durationMonths = plan?.duration ?? 1;

    // Proyectar períodos cerrados retroactivamente desde currentPeriodStart
    const closedPeriods: { startStr: string; endStr: string }[] = [];
    let tempStart = new Date(currentPeriodStart);

    while (tempStart > startDate) {
      // periodStartStr = tempStart menos durationMonths
      const periodStart = new Date(tempStart);
      periodStart.setMonth(periodStart.getMonth() - durationMonths);

      // periodEndStr = tempStart menos 1 día
      const periodEnd = new Date(tempStart);
      periodEnd.setDate(periodEnd.getDate() - 1);

      // Si el inicio queda antes del inicio de la membresía, limitarlo
      let finalStart = periodStart;
      if (periodStart < startDate) {
        finalStart = new Date(startDate);
      }

      if (periodEnd < finalStart) {
        break;
      }

      const startStr = toDateString(finalStart)!;
      const endStr = toDateString(periodEnd)!;

      closedPeriods.push({ startStr, endStr });

      // Avanzar hacia atrás
      tempStart = finalStart;

      // Si ya alcanzamos o pasamos el startDate, terminar
      if (finalStart <= startDate) {
        break;
      }
    }

    if (closedPeriods.length === 0) {
      console.log("   -> Sin períodos cerrados proyectados.");
      continue;
    }

    console.log(`   Proyectados ${closedPeriods.length} períodos históricos cerrados.`);

    for (const period of closedPeriods) {
      const { startStr, endStr } = period;

      const pStartMs = new Date(startStr + "T00:00:00").getTime();
      const pEndMs = new Date(endStr + "T23:59:59").getTime();

      // Contar clases registradas en este período cerrado
      const classesAttended = registrations.filter((reg) => {
        const regTime = new Date(reg.class.dateTime).getTime();
        return regTime >= pStartMs && regTime <= pEndMs;
      }).length;

      // Upsert en user_monthly_stats usando executeRaw
      try {
        const id = "stat_" + Math.random().toString(36).substring(2, 15);
        await prisma.$executeRaw`
          INSERT INTO "user_monthly_stats" ("id", "userId", "organizationId", "periodStart", "periodEnd", "classesAttended", "classesLimit", "planName", "createdAt")
          VALUES (${id}, ${userId}, ${organizationId}, ${new Date(startStr + "T00:00:00Z")}, ${new Date(endStr + "T00:00:00Z")}, ${classesAttended}, ${classLimit}, ${membershipType ?? "Plan"}, NOW())
          ON CONFLICT ("userId", "periodStart")
          DO UPDATE SET
            "periodEnd" = EXCLUDED."periodEnd",
            "classesAttended" = EXCLUDED."classesAttended",
            "classesLimit" = EXCLUDED."classesLimit",
            "planName" = EXCLUDED."planName"
        `;
        console.log(`   ✅ Consolidado: ${membershipType ?? "Plan"} | ${startStr} al ${endStr} | Clases: ${classesAttended}`);
        totalInsertedOrUpdated++;
      } catch (err: any) {
        console.error(`   ❌ Error consolidando período ${startStr} para ${user.email}:`, err.message);
      }
    }

    totalProcessed++;
  }

  console.log("\n" + "─".repeat(55));
  console.log("📊 Resumen del Backfill:");
  console.log(`   Membresías procesadas: ${totalProcessed}`);
  console.log(`   Períodos consolidados (insertados/actualizados): ${totalInsertedOrUpdated}`);
  console.log("─".repeat(55) + "\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error inesperado en backfill:", e);
  prisma.$disconnect();
  process.exit(1);
});
