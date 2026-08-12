import { NextRequest, NextResponse } from "next/server";
import { ErrorHandler } from "@/lib/errors/handler";
import { prisma } from "@/lib/prisma";
import { requireAuthFast } from "@/lib/supabase/auth-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId = "unknown";
  try {
    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    userId = id;

    const organizationId = auth.organizationId;

    // Lookup puntual: resuelve el CUID del perfil objetivo + confirma que
    // pertenece al mismo centro que el que consulta. No se modificó
    // requireAuth() para no penalizar latencia en todas las rutas del sistema.
    const targetProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        authId: true, 
        memberships: {
          where: { organizationId }
        } 
      },
    });

    if (!targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSelf = auth.user.id === targetProfile.authId;
    const isStaff = auth.role === "ADMIN" || auth.role === "COACH";
    const belongsToSameOrg = targetProfile.memberships.length > 0;

    if (!belongsToSameOrg || (!isSelf && !isStaff)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let totalInPeriod = 0;
    if (startDate && endDate) {
      totalInPeriod = await prisma.classRegistration.count({
        where: {
          userId,
          status: { not: 'cancelled' },
          class: {
            organizationId,
            dateTime: {
              gte: new Date(`${startDate}T00:00:00`),
              lte: new Date(`${endDate}T23:59:59`),
            },
          },
        },
      });
    }

    const parseSafeDate = (dateStr: string | null) => {
      if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;
      const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const d = new Date(cleanDate);
      return isNaN(d.getTime()) ? null : d;
    };

    const start = parseSafeDate(startDate);
    const end = parseSafeDate(endDate);

    const registrationsWithDetails = await prisma.classRegistration.findMany({
      where: {
        userId,
        status: { not: 'cancelled' },
        class: {
          organizationId,
          status: { not: 'cancelled' },
          ...(start || end ? {
            dateTime: {
              ...(start ? { gte: start } : {}),
              ...(end ? {
                lte: (() => {
                  const date = new Date(end);
                  date.setHours(23, 59, 59, 999);
                  return date;
                })()
              } : {})
            }
          } : {})
        }
      },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        classId: true,
        class: {
          select: {
            id: true,
            name: true,
            dateTime: true,
            durationMinutes: true,
            instructorId: true,
            disciplineId: true,
            capacity: true,
            status: true,
          }
        }
      },
      orderBy: { class: { dateTime: 'desc' } }
    });

    const classIds = registrationsWithDetails.map(r => r.classId);
    const enrolledCounts = await prisma.classRegistration.groupBy({
      by: ['classId'],
      where: { classId: { in: classIds }, status: 'registered' },
      _count: { classId: true },
    });
    const enrolledCountMap = new Map(
      enrolledCounts.map(e => [e.classId, e._count.classId])
    );

    const result = registrationsWithDetails.map((reg: any) => ({
      ...reg.class,
      registrationStatus: reg.status,
      registeredAt: reg.registeredAt,
      dateTime: reg.class.dateTime.toISOString(),
      enrolledCount: enrolledCountMap.get(reg.classId) ?? 0,
      isUserRegistered: true,
    }));

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        totalInPeriod,
        count: result.length,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "getUserClasses",
      resource: "registrations",
      metadata: { userId },
    });
  }
}
