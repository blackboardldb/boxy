import { NextRequest, NextResponse } from "next/server";
import { classService } from "@/lib/services/class-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireAuth } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";
import { createClassSessionSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const disciplineId = searchParams.get("disciplineId");
    const instructorId = searchParams.get("instructorId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    // OPTIMIZACIÓN: getClasses y findUser corren en paralelo.
    // findUser no depende de las clases — ambas queries son independientes.
    const [response, dbUser] = await Promise.all([
      classService.getClasses({
        page,
        limit,
        organizationId: auth.organizationId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        disciplineId: disciplineId || undefined,
        instructorId: instructorId || undefined,
        status: status || undefined,
      }),
      prisma.user.findFirst({
        where: { email: { equals: authUser.email, mode: "insensitive" } },
        select: { id: true },
      }),
    ]);

    if (!response.success) {
      return NextResponse.json(response);
    }

    // findRegistrations depende de ambos resultados — va después
    let userRegisteredClassIds: Set<string> = new Set();
    if (dbUser) {
      const classIds = response.data.map((c: any) => c.id);
      const registrations = await prisma.classRegistration.findMany({
        where: {
          userId: dbUser.id,
          status: "registered",
          classId: { in: classIds },
        },
        select: { classId: true },
      });
      userRegisteredClassIds = new Set(registrations.map((r) => r.classId));
    }

    const optimizedItems = response.data.map((session: any) => ({
      ...session,
      isUserRegistered: userRegisteredClassIds.has(session.id),
      alumnRegistred: `${session.enrolledCount || 0}/${session.capacity || 15}`,
    }));

    return NextResponse.json({
      ...response,
      data: optimizedItems,
      pagination: response.pagination,
    });
  } catch (error) {
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

    const response = await classService.createClass(parsed.data);
    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "createClass",
      resource: "classes",
    });
  }
}