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

    // 3. Promoción automática scheduled → active (Solo usuarios con membresía en tabla relacional)
    // Modelo UserMembership tiene @unique en userId: 1 fila por usuario.
    // Si status="scheduled" y currentPeriodStart <= hoy → promover a "active".
    if (dbUser.userMembership) {
      const um = dbUser.userMembership;
      const now = new Date();

      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago",
      }).format(now);

      if (um.status === "scheduled") {
        // Verificar si el plan ya debe estar activo (fecha de inicio pasó o es hoy)
        const startDateStr = um.currentPeriodStart ?? um.startDate;
        const startDate = startDateStr
          ? new Date(startDateStr)
          : null;

        const isReadyToActivate =
          startDate !== null &&
          new Date(today + "T00:00:00") >= new Date(
            startDate.toISOString().split("T")[0] + "T00:00:00"
          );

        if (isReadyToActivate) {
          // Promover en la tabla relacional (fuente de verdad)
          const promoted = await prisma.userMembership.update({
            where: { userId: dbUser.id },
            data: { status: "active" },
          });

          // Actualizar objeto en memoria para respuesta inmediata
          dbUser.userMembership = promoted;

          console.log(
            `[/api/me] UserMembership promoted to active for user ${dbUser.id}`
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
