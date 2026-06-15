import { NextRequest, NextResponse } from "next/server";
import { disciplineService } from "@/lib/services/discipline-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { requireAuth, requireAdmin } from "@/lib/supabase/auth-guard";
import { createDisciplineSchema } from "@/lib/schemas";


export async function GET(request: NextRequest) {
  try {
    // Autenticación básica
    const auth = await requireAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Use DisciplineService to get disciplines with filters
    const response = await disciplineService.getDisciplines({
      page,
      limit,
      isActive: isActive ? isActive === "true" : undefined,
      search: search || undefined,
    });

    // Alumnos piden isActive=true → caché 10 min en CDN
    // Admin pide todas → sin caché
    const cacheHeader = isActive === "true"
      ? "public, s-maxage=600, stale-while-revalidate=60"
      : "no-store";

    return NextResponse.json(response, {
      headers: { "Cache-Control": cacheHeader },
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "getDisciplines",
      resource: "disciplines",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Solo administradores pueden crear disciplinas
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const parsed = createDisciplineSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Use DisciplineService to create discipline with validation
    const response = await disciplineService.createDiscipline(parsed.data);

    // Return standardized response
    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    // Use ErrorHandler to create standardized error response
    return ErrorHandler.createResponse(error, {
      operation: "createDiscipline",
      resource: "disciplines",
    });
  }
}

