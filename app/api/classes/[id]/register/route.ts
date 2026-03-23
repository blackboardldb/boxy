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

    // Get all class sessions for validation (needed for daily limit check)
    // Note: optimization needed here to not query ALL classes
    const allClassSessions = await prisma.classSession.findMany({
       where: { registeredParticipantsIds: { has: userId } }
    });

    // Formatear fechas de Prisma (objetos Date) a strings (como las espera el validation service)
    const classSessionWithStrDate = { 
      ...classSession, 
      dateTime: classSession.dateTime instanceof Date ? classSession.dateTime.toISOString() : classSession.dateTime 
    };
    
    const allClassSessionsWithStrDate = allClassSessions.map((c: any) => ({
      ...c,
      dateTime: c.dateTime instanceof Date ? c.dateTime.toISOString() : c.dateTime
    }));

    // Validate if user can register using the validation service
    const validation = await ValidationService.canUserRegisterToClass(
      user as any,
      classSessionWithStrDate as any,
      allClassSessionsWithStrDate as any
    );

    if (!validation.canRegister) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // Update class session
      const updatedClassSession = await tx.classSession.update({
        where: { id: classId },
        data: {
          registeredParticipantsIds: [
            ...classSession.registeredParticipantsIds,
            userId,
          ],
        },
      });

      // Update user's remaining classes if applicable
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
                  remainingClasses: Math.max(0, (memberData.centerStats?.currentMonth?.remainingClasses || 1) - 1),
                },
              },
            },
          },
        });
      }

      return updatedClassSession;
    });

    return NextResponse.json({
      message: "Successfully registered for class",
      class: result,
    });
  } catch (error) {
    console.error("Error registering for class:", error);
    return NextResponse.json(
      { error: "Failed to register for class" },
      { status: 500 }
    );
  }
}
