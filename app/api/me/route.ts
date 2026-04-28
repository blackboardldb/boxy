import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// HAL-01 Fase 4 Sprint 1.5: La promoción scheduled→active ya no lee ni escribe
// en el JSONB membership. Opera directamente sobre la tabla UserMembership.
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 1. Buscar en public.users (alumnos/clientes)
    let dbUser: any = await prisma.user.findFirst({
      where: { email: { equals: user.email!, mode: "insensitive" } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        emergencyContact: true,
        userMembership: true,    // ← HAL-01: fuente de verdad relacional
        membershipRenewals: {
          orderBy: { requestedAt: 'desc' }
        },
      },
    });

    // 2. Si no es alumno, buscar en public.instructors
    if (!dbUser) {
      const instructor = await prisma.instructor.findFirst({
        where: { email: { equals: user.email!, mode: "insensitive" } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (instructor) {
        dbUser = {
          id: instructor.id,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          email: instructor.email,
          role: (instructor as Record<string, unknown>).role || "coach",
          userMembership: null,
        };
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Usuario o Instructor no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    // 3. Promoción automática scheduled → active
    // Primero: revisar si hay un MembershipRenewal con status='scheduled' y startDate <= hoy
    //          → promover a UserMembership y marcar renewal como 'approved'
    // Segundo (fallback): si UserMembership tiene status='scheduled' y su startDate <= hoy
    //          → promover a 'active' directamente (comportamiento legacy)
    const now = new Date();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santiago",
    }).format(now);
    const todayDate = new Date(today + "T00:00:00");

    const scheduledRenewal = (dbUser.membershipRenewals ?? []).find((r: any) => {
      if (r.status !== 'scheduled') return false;
      const details = r.renewalDetails as any;
      if (!details?.startDate) return false;
      return new Date(details.startDate + 'T00:00:00') <= todayDate;
    });

    if (scheduledRenewal) {
      const details = scheduledRenewal.renewalDetails as any;

      // Construir datos de upsert desde el renewal
      const promotionData = {
        organizationId:    dbUser.userMembership?.organizationId ?? "org_blacksheep_001",
        planId:            scheduledRenewal.requestedPlanId ?? null,
        status:            "active",
        startDate:         details.startDate  ? new Date(details.startDate)  : null,
        currentPeriodStart: details.startDate ? new Date(details.startDate)  : null,
        currentPeriodEnd:   details.endDate   ? new Date(details.endDate)    : null,
        monthlyPrice:      details.monthlyPrice ?? null,
        membershipType:    details.membershipType ?? null,
        classLimit:        details.classLimit ?? 0,
      };

      const promoted = await prisma.userMembership.upsert({
        where:  { userId: dbUser.id },
        create: { userId: dbUser.id, ...promotionData },
        update: promotionData,
      });

      // Marcar el renewal como approved
      await prisma.membershipRenewal.update({
        where: { id: scheduledRenewal.id },
        data:  { status: 'approved', processedAt: now },
      });

      dbUser.userMembership = promoted;
      // Actualizar la lista en memoria para que la respuesta refleje el estado nuevo
      dbUser.membershipRenewals = dbUser.membershipRenewals.map((r: any) =>
        r.id === scheduledRenewal.id ? { ...r, status: 'approved', processedAt: now } : r
      );

      console.log(
        `[/api/me] MembershipRenewal promoted to UserMembership active for user ${dbUser.id} (renewal ${scheduledRenewal.id})`
      );
    } else if (dbUser.userMembership) {
      // Fallback legacy: UserMembership con status='scheduled' cuya fecha ya llegó
      const um = dbUser.userMembership;

      if (um.status === "scheduled") {
        const startDateStr = um.currentPeriodStart ?? um.startDate;
        const startDate = startDateStr ? new Date(startDateStr) : null;

        const isReadyToActivate =
          startDate !== null &&
          todayDate >= new Date(
            startDate.toISOString().split("T")[0] + "T00:00:00"
          );

        if (isReadyToActivate) {
          const promoted = await prisma.userMembership.update({
            where: { userId: dbUser.id },
            data:  { status: "active" },
          });
          dbUser.userMembership = promoted;
          console.log(
            `[/api/me] UserMembership (legacy) promoted to active for user ${dbUser.id}`
          );
        }
      }
    }

    // 4. Construir respuesta: mapear userMembership al shape que espera el cliente
    //    (mismo shape que antes devolvía membership JSONB, construido desde la tabla)
    const um = dbUser.userMembership;
    const membership = um
      ? {
          id: um.id,
          organizationId: um.organizationId,
          status: um.status,
          membershipType: um.membershipType ?? "",
          planId: um.planId ?? undefined,
          monthlyPrice: um.monthlyPrice ?? 0,
          startDate: um.startDate
            ? new Date(um.startDate).toISOString().split("T")[0]
            : "",
          currentPeriodStart: um.currentPeriodStart
            ? new Date(um.currentPeriodStart).toISOString().split("T")[0]
            : "",
          currentPeriodEnd: um.currentPeriodEnd
            ? new Date(um.currentPeriodEnd).toISOString().split("T")[0]
            : "",
          planConfig: {
            classLimit: um.classLimit,
            disciplineAccess: um.disciplineAccess as "all" | "limited",
            allowedDisciplines: um.allowedDisciplines ?? [],
            canFreeze: um.canFreeze,
            freezeDurationDays: um.freezeDurationDays,
            autoRenews: um.autoRenews,
          },
          centerStats: {
            currentMonth: {
              classesAttended: 0,
              classesContracted: um.classLimit,
              remainingClasses: um.classLimit, // HAL-09b calcula el real desde ClassRegistration
              noShows: 0,
              lastMinuteCancellations: 0,
            },
            totalMonthsActive: 0,
            memberSince: um.startDate
              ? new Date(um.startDate).toISOString().split("T")[0]
              : um.createdAt
              ? new Date(um.createdAt).toISOString().split("T")[0]
              : "",
            lifetimeStats: {
              totalClasses: 0,
              totalNoShows: 0,
              averageMonthlyAttendance: 0,
              bestMonth: { month: "", year: 0, count: 0 },
            },
          },
          centerConfig: {
            allowCancellation: um.allowCancellation,
            cancellationHours: um.cancellationHours,
            maxBookingsPerDay: um.maxBookingsPerDay,
            autoWaitlist: um.autoWaitlist,
          },
        }
      : null;

    const responseData = {
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      phone: dbUser.phone ?? undefined,
      gender: dbUser.gender ?? undefined,
      dateOfBirth: dbUser.dateOfBirth
        ? new Date(dbUser.dateOfBirth).toISOString().split("T")[0]
        : undefined,
      emergencyContact: dbUser.emergencyContact ?? undefined,
      membership,
      membershipRenewals: dbUser.membershipRenewals,
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("[/api/me] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
