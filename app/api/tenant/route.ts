import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint to resolve tenant information by slug before login.
 * This is used by the frontend to get the organization details based on the subdomain.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        themePrimaryColor: true,
        themeVariant: true,
        // LogoUrl can be added here once it's in the schema
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({
      organizationId: org.id,
      name: org.name,
      themePrimaryColor: org.themePrimaryColor,
      themeVariant: org.themeVariant,
    });
  } catch (error) {
    console.error("[/api/tenant] Public Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
