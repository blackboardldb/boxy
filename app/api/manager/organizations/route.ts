import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

export async function GET() {
  try {
    await requireManager();
    const orgs = await managerService.listAll();
    return NextResponse.json(orgs);
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireManager();
    const body = await request.json();
    
    if (!body.name || !body.slug || !body.adminEmail || !body.adminFirstName || !body.adminLastName) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const org = await managerService.createOrganization(
      { name: body.name, slug: body.slug, billingCycle: "A" },
      { email: body.adminEmail, firstName: body.adminFirstName, lastName: body.adminLastName }
    );

    return NextResponse.json(org, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/manager/organizations] Error:", error);
    return NextResponse.json(
      { error: "Error al crear la organización", details: error.message },
      { status: 500 }
    );
  }
}
