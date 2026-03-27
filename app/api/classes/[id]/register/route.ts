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

    // Get current registration status for this user in this class
    const existingRegistration = await prisma.classRegistration.findUnique({
      where: {
        userId_classId: {
          userId,
          classId
        }
      }
    });

    if (existingRegistration && existingRegistration.status === 'registered') {
      return NextResponse.json({ error: "Ya estás inscrito a esta clase" }, { status: 400 });
    }

    // Get all class registrations for the target day for daily limit check
    const targetDate = classSession.dateTime.toISOString().split("T")[0];
    const dayRegistrations = await prisma.classRegistration.findMany({
      where: {
        userId,
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

    // Validate if user can register using the validation service
    // For now, keep the interface but we should eventually update it
    const validation = await ValidationService.canUserRegisterToClass(
      user as any,
      classSession as any,
      dayRegistrations.map(r => r.class) as any
    );

    if (!validation.canRegister) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create registration record
      const registration = await tx.classRegistration.upsert({
        where: {
          userId_classId: {
            userId,
            classId
          }
        },
        update: {
          status: 'registered',
          registeredAt: new Date()
        },
        create: {
          userId,
          classId,
          status: 'registered'
        }
      });

      // 2. Update class session array (keeping in sync for now)
      const updatedClassSession = await tx.classSession.update({
        where: { id: classId },
        data: {
          registeredParticipantsIds: [
            ...classSession.registeredParticipantsIds.filter(id => id !== userId),
            userId,
          ],
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
