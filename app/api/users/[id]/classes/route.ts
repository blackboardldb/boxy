import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorHandler } from "@/lib/errors/handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId = "unknown";
  try {
    userId = (await params).id;

    // Get all class registrations for this user with session details
    const registrations = await prisma.classRegistration.findMany({
      where: { 
        userId,
        status: { not: 'cancelled' } // Only active registrations
      },
      include: {
        class: {
          include: {
            discipline: true,
            instructor: true
          }
        }
      },
      orderBy: {
        class: {
          dateTime: 'desc'
        }
      }
    });

    // Format response to look like ClassSession list for backward compatibility
    // but enriched with registration status
    const result = registrations.map(reg => ({
      ...reg.class,
      registrationStatus: reg.status,
      registeredAt: reg.registeredAt,
      // Ensure date is string for frontend
      dateTime: reg.class.dateTime.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        count: result.length,
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
