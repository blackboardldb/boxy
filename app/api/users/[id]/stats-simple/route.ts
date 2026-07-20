import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const auth = await requireAuth();
  
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId, user, role } = auth;

  // Aislamiento: solo el propio alumno o un admin del mismo centro pueden ver esto
  if (role !== "ADMIN" && user.id !== userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Verificar que el usuario pertenezca al centro de la sesión
  if (role === "ADMIN") {
    const userInOrg = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId } }
    });
    if (!userInOrg) {
      return NextResponse.json({ error: "Usuario no pertenece a este centro" }, { status: 403 });
    }
  }

  const totalClasses = await prisma.classRegistration.count({
    where: {
      userId,
      status: "registered",
      class: {
        dateTime: { lt: new Date() },
        organizationId,
      },
    },
  });

  const favoriteSchedule = await prisma.$queryRaw<
    { day_of_week: number; hour: number; count: bigint }[]
  >`
    SELECT
      EXTRACT(DOW FROM c."dateTime") AS day_of_week,
      EXTRACT(HOUR FROM c."dateTime") AS hour,
      COUNT(*) AS count
    FROM "public"."class_registrations" cr
    JOIN "public"."class_sessions" c ON c.id = cr."classId"
    WHERE cr."userId" = ${userId}
      AND cr."status" = 'registered'
      AND c."dateTime" < NOW()
      AND c."organizationId" = ${organizationId}
    GROUP BY day_of_week, hour
    ORDER BY count DESC
    LIMIT 1
  `;

  return NextResponse.json({
    totalClasses,
    favoriteDayOfWeek: favoriteSchedule[0] ? Number(favoriteSchedule[0].day_of_week) : null,
    favoriteHour: favoriteSchedule[0] ? Number(favoriteSchedule[0].hour) : null,
  });
}
