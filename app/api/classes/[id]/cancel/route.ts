import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ValidationService } from "@/lib/validation-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await request.json();
    const { id: classId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the class session
    const classSession = await prisma.classSession.findUnique({
      where: { id: classId },
    });

    if (!classSession) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get the user with full profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the discipline for validation rules
    const discipline = await prisma.discipline.findUnique({
      where: { id: classSession.disciplineId },
    });

    if (!discipline) {
      return NextResponse.json(
        { error: "Discipline not found" },
        { status: 404 }
      );
    }

    // Formatear fechas de Prisma a strings
    const classSessionWithStrDate = { 
      ...classSession, 
      dateTime: classSession.dateTime instanceof Date ? classSession.dateTime.toISOString() : classSession.dateTime 
    };

    // Validate if user can cancel using the validation service
    const validation = await ValidationService.canUserCancelClassWithRules(
      user as any,
      classSessionWithStrDate as any,
      discipline as any
    );

    if (!validation.canCancel) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Update/Delete registration record
      // We'll marked it as cancelled or just delete it. 
      // The user wants to keep history, but ClassRegistration has a 'cancelled' status option in schema.
      await tx.classRegistration.update({
        where: {
          userId_classId: {
            userId,
            classId
          }
        },
        data: {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      });

      // 2. Update class session array (keeping in sync for now)
      const updatedClassSession = await tx.classSession.update({
        where: { id: classId },
        data: {
          registeredParticipantsIds:
            classSession.registeredParticipantsIds.filter(
              (id: string) => id !== userId
            ),
          waitlistParticipantsIds: classSession.waitlistParticipantsIds.filter(
            (id: string) => id !== userId
          ),
        },
      });

      // 3. Update user's remaining classes if applicable
      const memberData = user.membership as any;
      if (memberData?.planConfig?.classLimit > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            membership: {
              ...memberData,
              centerStats: {
                ...memberData.centerStats,
                currentMonth: {
                  ...memberData.centerStats?.currentMonth,
                  remainingClasses: (memberData.centerStats?.currentMonth?.remainingClasses || 0) + 1,
                },
              },
            },
          },
        });
      }

      return updatedClassSession;
    });

    return NextResponse.json({
      message: "Successfully cancelled registration",
      class: result,
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
