import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

// ─── Tipos de respuesta ────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  label: string;
  achieved: boolean;
  emoji: string;
  /** Solo en logros progresivos: el nivel conseguido o el próximo umbral */
  hint?: string;
}

export interface PeriodHistory {
  periodStart: string;
  periodEnd: string | null;
  planName: string;
  classesAttended: number;
}

export interface UserStatsResponse {
  totalClasses: number;
  monthsActive: number;
  favoriteDiscipline: string | null;
  favoriteTime: "AM" | "PM";
  achievements: Achievement[];
  periodHistory: PeriodHistory[];
}

// ─── Constantes de progresión ──────────────────────────────────────────────────

const CLASS_THRESHOLDS = [10, 50, 100, 200] as const;
const MONTHS_THRESHOLDS = [3, 6, 12, 24] as const;

// ─── Helper: logros progresivos ────────────────────────────────────────────────

function buildProgressiveAchievement(
  id: string,
  emoji: string,
  thresholds: readonly number[],
  current: number,
  unit: string
): Achievement[] {
  // Último umbral superado
  const lastAchieved = [...thresholds].reverse().find((t) => current >= t);
  // Próximo umbral
  const nextThreshold = thresholds.find((t) => current < t);

  const results: Achievement[] = [];

  if (lastAchieved !== undefined) {
    results.push({
      id: `${id}-${lastAchieved}`,
      label: `${lastAchieved} ${unit}`,
      achieved: true,
      emoji,
      hint: `Llevas ${current}`,
    });
  }

  if (nextThreshold !== undefined) {
    results.push({
      id: `${id}-next-${nextThreshold}`,
      label: `${nextThreshold} ${unit}`,
      achieved: false,
      emoji,
      hint: `Próximo hito`,
    });
  }

  return results;
}

// ─── Helper: formato fecha seguro ──────────────────────────────────────────────

function toDateString(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value).split("T")[0];
}

// ─── GET /api/users/[id]/stats ─────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: userId } = await params;

    // Guard: el alumno solo puede ver sus propias estadísticas.
    // auth.user.id es el UUID de Supabase auth — distinto del cuid de public.users.
    // Buscamos el registro en public.users por email para obtener el id real.
    const dbUser = await prisma.user.findUnique({
      where: { email: auth.user.email! },
      select: { id: true, organizationId: true },
    });

    if (!dbUser || dbUser.id !== userId) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const organizationId = dbUser.organizationId;


    // ─── 1. Registros de clase del alumno ────────────────────────────────────
    const registrations = await prisma.classRegistration.findMany({
      where: {
        userId,
        status: "registered",
        class: {
          dateTime: { lt: new Date() },
          organizationId,
        },
      },
      select: {
        class: {
          select: {
            dateTime: true,
            disciplineId: true,
            discipline: { select: { name: true } },
          },
        },
      },
    });

    const totalClasses = registrations.length;

    // ─── 2. Meses activo (renewals aprobados) ────────────────────────────────
    const renewals = await prisma.membershipRenewal.findMany({
      where: { userId, organizationId, status: "approved" },
      select: {
        id: true,
        requestedAt: true,
        renewalDetails: true,
        amount: true,
      },
      orderBy: { requestedAt: "desc" },
      take: 12,
    });

    const monthsActive = renewals.length;

    // ─── 3. Disciplina favorita ───────────────────────────────────────────────
    const disciplineCount: Record<string, { name: string; count: number }> = {};
    for (const reg of registrations) {
      const { disciplineId, discipline } = reg.class;
      if (!disciplineCount[disciplineId]) {
        disciplineCount[disciplineId] = { name: discipline?.name ?? disciplineId, count: 0 };
      }
      disciplineCount[disciplineId].count++;
    }

    const favoriteDiscipline =
      Object.values(disciplineCount).sort((a, b) => b.count - a.count)[0]
        ?.name ?? null;

    const distinctDisciplines = Object.keys(disciplineCount).length;

    // ─── 4. Horario favorito AM/PM (timezone America/Santiago) ──────────────
    // Prisma retorna dateTime como Date en UTC; convertimos a hora local Chile.
    let amCount = 0;
    let pmCount = 0;

    for (const reg of registrations) {
      const chileHour = parseInt(
        new Date(reg.class.dateTime).toLocaleString("en-US", {
          timeZone: "America/Santiago",
          hour: "numeric",
          hour12: false,
        })
      );
      if (chileHour < 12) {
        amCount++;
      } else {
        pmCount++;
      }
    }

    const favoriteTime: "AM" | "PM" = amCount >= pmCount ? "AM" : "PM";

    // ─── 5. Logros ────────────────────────────────────────────────────────────
    const achievements: Achievement[] = [];

    // Clases (progresivo)
    achievements.push(
      ...buildProgressiveAchievement(
        "classes",
        "🏆",
        CLASS_THRESHOLDS,
        totalClasses,
        "clases"
      )
    );

    // Meses miembro (progresivo)
    achievements.push(
      ...buildProgressiveAchievement(
        "months",
        "❤️",
        MONTHS_THRESHOLDS,
        monthsActive,
        "meses"
      )
    );

    // Madrugador (one-shot: 5+ clases AM)
    achievements.push({
      id: "early-bird",
      label: "Madrugador",
      achieved: amCount >= 5,
      emoji: "🌅",
      hint: amCount >= 5 ? `${amCount} clases AM` : `Falta: ${5 - amCount} clases AM`,
    });

    // Nocturno (one-shot: 5+ clases PM)
    achievements.push({
      id: "night-owl",
      label: "Nocturno",
      achieved: pmCount >= 5,
      emoji: "🌙",
      hint: pmCount >= 5 ? `${pmCount} clases PM` : `Falta: ${5 - pmCount} clases PM`,
    });

    // Multidisciplina (one-shot: 3+ disciplinas distintas)
    achievements.push({
      id: "multidiscipline",
      label: "Multidisciplina",
      achieved: distinctDisciplines >= 3,
      emoji: "🎯",
      hint:
        distinctDisciplines >= 3
          ? `${distinctDisciplines} disciplinas`
          : `Falta: ${3 - distinctDisciplines} disciplinas más`,
    });

    // ─── 6. Historial de períodos ─────────────────────────────────────────────
    // Primero intenta user_monthly_stats (períodos cerrados consolidados)
    // Usamos $queryRaw porque el modelo puede no estar en el cliente generado aún
    // si la migration no se ejecutó en BD — el fallback a renewals garantiza
    // que el endpoint funciona incluso antes del `prisma db push`.
    type RawMonthlyStat = {
      periodStart: Date;
      periodEnd: Date;
      classesAttended: number;
      planName: string | null;
    };

    let consolidatedStats: RawMonthlyStat[] = [];
    try {
      consolidatedStats = await prisma.$queryRaw<RawMonthlyStat[]>`
        SELECT "periodStart", "periodEnd", "classesAttended", "planName"
        FROM user_monthly_stats
        WHERE "userId" = ${userId}
          AND "organizationId" = ${organizationId}
        ORDER BY "periodStart" DESC
        LIMIT 12
      `;
    } catch {
      // La tabla aún no existe en BD — el fallback la maneja
      consolidatedStats = [];
    }

    let periodHistory: PeriodHistory[];

    if (consolidatedStats.length > 0) {
      periodHistory = consolidatedStats.map((s: RawMonthlyStat) => ({
        periodStart: toDateString(s.periodStart) ?? "",
        periodEnd: toDateString(s.periodEnd),
        planName: s.planName ?? "Plan",
        classesAttended: s.classesAttended,
      }));
    } else {
      periodHistory = [];
    }

    // ─── Respuesta ────────────────────────────────────────────────────────────
    const response: UserStatsResponse = {
      totalClasses,
      monthsActive,
      favoriteDiscipline,
      favoriteTime,
      achievements,
      periodHistory,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("[GET /api/users/[id]/stats]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
