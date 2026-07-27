import { prisma } from "./prisma";
import {
  parseISO,
  addMinutes,
  isAfter,
  addHours,
  formatDistanceToNow,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import type {
  ClassSession,
  Discipline,
  CancellationValidation,
} from "./types";
import { getPlanStatus, isClassWithinPlanValidity, formatTimeChile } from "./utils";

// Helper function to get cancellation rule for a specific time
function getCancellationRule(
  classTime: string,
  discipline: Discipline
): { hoursBefore: number; reason: string } {
  const defaultRule = {
    hoursBefore: 0.5,
    reason: "Política estándar de cancelación (30 min)",
  };

  if (
    discipline.cancellationRules &&
    Array.isArray(discipline.cancellationRules)
  ) {
    const specificRule = discipline.cancellationRules.find(
      (rule) => rule.time === classTime
    );
    if (specificRule) {
      return {
        hoursBefore: specificRule.hoursBefore,
        reason: `Regla específica: ${specificRule.hoursBefore}h antes para clase de ${specificRule.time}`,
      };
    }
  }

  return defaultRule;
}

/**
 * Servicio centralizado de validaciones para el backend
 * Todas las validaciones de negocio se manejan aquí
 */
export class ValidationService {
  static async canUserRegisterToClass(
    userId: string,
    classSession: ClassSession,
    allClassSessions?: ClassSession[]
  ): Promise<{ canRegister: boolean; reason?: string }> {
    const now = new Date();
    const classStart = typeof classSession.dateTime === 'string' 
      ? parseISO(classSession.dateTime) 
      : classSession.dateTime;
    const classEnd = addMinutes(classStart, classSession.durationMinutes || 60);

    if (classSession.status === "cancelled") {
      return { canRegister: false, reason: "La clase ha sido cancelada" };
    }

    if (isAfter(now, classEnd)) {
      return { canRegister: false, reason: "La clase ya finalizó" };
    }

    const isUserRegistered = await prisma.classRegistration.findFirst({
      where: { classId: classSession.id, userId, status: 'registered' }
    });
    if (isUserRegistered) {
      return { canRegister: false, reason: "Ya estás inscrito a esta clase" };
    }

    if (
      (classSession.enrolledCount || 0) >= classSession.capacity
    ) {
      return { canRegister: false, reason: "No hay cupos disponibles" };
    }

    const userMembership = await prisma.userMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId: classSession.organizationId } },
    });

    if (!userMembership) {
      return { canRegister: false, reason: "No tienes un plan activo o programado para esta fecha" };
    }

    let remainingClasses = 0;
    if (userMembership.classLimit && userMembership.classLimit > 0) {
      const periodStart = userMembership.currentPeriodStart ? new Date(userMembership.currentPeriodStart) : new Date(0);
      const classesUsed = await prisma.classRegistration.count({
        where: { userId, status: 'registered', class: { dateTime: { gte: periodStart } } }
      });
      remainingClasses = Math.max(0, userMembership.classLimit - classesUsed);
    }

    const mockUser = {
      membership: {
        status: userMembership.status,
        currentPeriodStart: userMembership.currentPeriodStart,
        currentPeriodEnd: userMembership.currentPeriodEnd,
        startDate: userMembership.startDate,
        classLimit: userMembership.classLimit,
        centerStats: { currentMonth: { remainingClasses } },
      }
    };

    const planStatus = getPlanStatus(mockUser);
    if (
      planStatus !== "active" && planStatus !== "scheduled"
    ) {
      return { canRegister: false, reason: "No tienes un plan activo o programado para esta fecha" };
    }

    if (!isClassWithinPlanValidity(mockUser, classSession.dateTime)) {
       return { canRegister: false, reason: "La fecha de esta clase supera la fecha de expiración de tu plan" };
    }

    if (userMembership.classLimit && userMembership.classLimit > 0) {
      if (remainingClasses <= 0) {
        return {
          canRegister: false,
          reason: "No tienes clases disponibles en tu plan",
        };
      }
    }

    if (userMembership.disciplineAccess === "limited") {
      const allowedDisciplines = Array.isArray(userMembership.allowedDisciplines) 
        ? userMembership.allowedDisciplines 
        : [];
      if (!allowedDisciplines.includes(classSession.disciplineId)) {
        return {
          canRegister: false,
          reason: "Tu plan no incluye esta disciplina",
        };
      }
    }

    let targetDayClasses: ClassSession[] = [];
    const targetDate = typeof classSession.dateTime === 'string' 
      ? classSession.dateTime.split("T")[0]
      : (classSession.dateTime as Date).toISOString().split("T")[0];

    if (allClassSessions) {
      targetDayClasses = allClassSessions.filter((session) => {
        const sessionDate = typeof session.dateTime === 'string'
          ? session.dateTime.split("T")[0]
          : (session.dateTime as Date).toISOString().split("T")[0];
        return sessionDate === targetDate;
      });
    } else {
      try {
        const registrations = await prisma.classRegistration.findMany({
          where: {
            userId: userId,
            status: 'registered',
            class: {
              dateTime: {
                gte: new Date(`${targetDate}T00:00:00`),
                lte: new Date(`${targetDate}T23:59:59`)
              }
            }
          },
          include: {
            class: true
          }
        });
        targetDayClasses = registrations.map(r => r.class as unknown as ClassSession);
      } catch (error) {
        console.warn(
          "[ValidationService] Could not fetch target day's registrations for validation:",
          error
        );
      }
    }

    const maxBookingsPerDay = userMembership.maxBookingsPerDay || 2;

    if (targetDayClasses.length >= maxBookingsPerDay) {
      const isToday = targetDate === new Date().toISOString().split("T")[0];
      const daySuffix = isToday ? "hoy" : "este día";
      return {
        canRegister: false,
        reason: `Ya tienes ${maxBookingsPerDay} clases inscritas para ${daySuffix}`,
      };
    }

    return { canRegister: true };
  }

  static async canUserCancelClassWithRules(
    userId: string,
    classSession: ClassSession,
    discipline: Discipline
  ): Promise<CancellationValidation> {
    const now = new Date();
    const classStart = typeof classSession.dateTime === 'string' 
      ? parseISO(classSession.dateTime) 
      : classSession.dateTime;
    const classTime = formatTimeChile(classSession.dateTime);

    const isUserRegistered = await prisma.classRegistration.findFirst({
      where: { classId: classSession.id, userId, status: 'registered' }
    });
    if (!isUserRegistered) {
      return {
        canCancel: false,
        reason: "No estás inscrito a esta clase",
        hoursBefore: 0,
      };
    }

    if (isAfter(now, classStart)) {
      return {
        canCancel: false,
        reason: "No puedes cancelar una clase que ya comenzó",
        hoursBefore: 0,
      };
    }

    const { hoursBefore, reason } = getCancellationRule(classTime, discipline);
    const cancellationDeadline = addHours(classStart, -hoursBefore);

    if (isAfter(now, cancellationDeadline)) {
      const timeUntilDeadline = formatDistanceToNow(cancellationDeadline, {
        addSuffix: true,
        includeSeconds: false,
      });

      return {
        canCancel: false,
        reason: `Ya pasó el plazo de cancelación (${timeUntilDeadline})`,
        timeUntilDeadline: "Ya pasó el plazo",
        deadline: cancellationDeadline,
        hoursBefore,
      };
    }

    const hoursRemaining = differenceInHours(cancellationDeadline, now);
    const minutesRemaining =
      differenceInMinutes(cancellationDeadline, now) % 60;

    let timeUntilDeadline = "";
    if (hoursRemaining > 0) {
      timeUntilDeadline = `${hoursRemaining}h ${
        minutesRemaining > 0 ? `${minutesRemaining}m` : ""
      }`.trim();
    } else {
      timeUntilDeadline = `${minutesRemaining}m`;
    }

    return {
      canCancel: true,
      reason,
      timeUntilDeadline,
      deadline: cancellationDeadline,
      hoursBefore,
    };
  }

  static async canUserCancelClass(
    userId: string,
    classSession: ClassSession
  ): Promise<{ canCancel: boolean; reason?: string }> {
    const now = new Date();
    const classStart = typeof classSession.dateTime === 'string' 
      ? parseISO(classSession.dateTime) 
      : classSession.dateTime;

    const isUserRegistered = await prisma.classRegistration.findFirst({
      where: { classId: classSession.id, userId, status: 'registered' }
    });
    if (!isUserRegistered) {
      return { canCancel: false, reason: "No estás inscrito a esta clase" };
    }

    if (isAfter(now, classStart)) {
      return {
        canCancel: false,
        reason: "No puedes cancelar una clase que ya comenzó",
      };
    }

    const userMembership = await prisma.userMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId: classSession.organizationId } },
    });
    const cancellationHours = userMembership?.cancellationHours || 2;
    const cancellationDeadline = addHours(classStart, -cancellationHours);

    if (isAfter(now, cancellationDeadline)) {
      return {
        canCancel: false,
        reason: `Solo puedes cancelar hasta ${cancellationHours} horas antes de la clase`,
      };
    }

    return { canCancel: true };
  }
}
