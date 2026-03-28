import { NextRequest, NextResponse } from "next/server";
import { ErrorHandler } from "@/lib/errors/handler";
import { getDataProvider } from "@/lib/data-layer/provider-factory";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId = "unknown";
  try {
    const { id } = await params;
    userId = id;
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const provider = getDataProvider();

    // Get period totals (optimized SQL count)
    let totalInPeriod = 0;
    if (startDate && endDate) {
      totalInPeriod = await provider.classRegistrations.countUserRegistrationsInPeriod(
        userId, 
        startDate, 
        endDate
      );
    }

    // 3. Enrich with session details (already handled by repository findMany if implemented correctly,
    // but the current repository implementation might need custom include support)
    // In this specific case, we'll continue using prisma directly temporarily for the enrichment 
    // until the repository supports complex includes, but the count is already optimized.
    
    // BACKWARD COMPATIBILITY: Format same as before but with metadata
    // Robust date parsing (extract only date part if already an ISO string)
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
        status: { not: 'cancelled' as any },
        ...(start && end ? {
          class: {
            dateTime: {
              gte: start,
              lte: (() => {
                const date = new Date(end);
                date.setHours(23, 59, 59, 999);
                return date;
              })()
            }
          }
        } : {})
      },
      select: {
        id: true,
        status: true,
        registeredAt: true,
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
            _count: {
              select: { registrations: true }
            }
          }
        }
      },
      orderBy: { class: { dateTime: 'desc' } }
    });

    const result = registrationsWithDetails.map((reg: any) => ({
      ...reg.class,
      registrationStatus: reg.status,
      registeredAt: reg.registeredAt,
      dateTime: reg.class.dateTime.toISOString(),
      // Optimization: Send only necessary info for list view
      enrolledCount: reg.class._count.registrations,
      isUserRegistered: true,
      registeredParticipantsIds: [], // Empty to save BW in lists
      waitlistParticipantsIds: []
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
