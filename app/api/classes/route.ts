import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/lib/services/class-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { createClassSessionSchema } from "@/lib/schemas";


export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const disciplineId = searchParams.get("disciplineId");
    const instructorId = searchParams.get("instructorId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100"); // Aumentar límite para listados

    // 1. Obtener clases del servicio
    const response: any = await classService.getClasses({
      page,
      limit,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      disciplineId: disciplineId || undefined,
      instructorId: instructorId || undefined,
      status: status || undefined,
    });

    if (!response.success) {
      return NextResponse.json(response);
    }

    // 2. Identificar clases donde el usuario actual está inscrito
    let userRegisteredClassIds: Set<string> = new Set();
    let dbUserId: string | null = null;
    
    if (authUser && authUser.email) {
      // Optimizamos buscando al usuario en DB solo si hay sesión
      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: authUser.email, mode: "insensitive" } },
        select: { id: true }
      });

      if (dbUser) {
        dbUserId = dbUser.id;
        const registrations = await prisma.classRegistration.findMany({
          where: {
            userId: dbUser.id,
            status: 'registered',
            class: {
              dateTime: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
              }
            }
          },
          select: { classId: true }
        });
        userRegisteredClassIds = new Set(registrations.map(r => r.classId));
      }
    }

    // 3. Enriquecer respuesta con flags de optimización y limpiar arrays pesados
    const optimizedItems = response.data.map((session: any) => ({
      ...session,
      isUserRegistered: userRegisteredClassIds.has(session.id),
      // Aseguramos que enrolledCount venga del repo
      alumnRegistred: `${session.enrolledCount || 0}/${session.capacity || 15}`
    }));

    return NextResponse.json({
      ...response,
      data: optimizedItems,
      pagination: response.pagination
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getClasses",
      resource: "classes",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const parsed = createClassSessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Use ClassService to create class with validation
    const response = await classService.createClass(parsed.data);

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "createClass",
      resource: "classes",
    });
  }
}
