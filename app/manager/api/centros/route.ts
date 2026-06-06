import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";

export async function POST(req: Request) {
  try {
    await requireManager();
    const body = await req.json();

    const {
      name,
      slug,
      billingCycle,
      email,
      phone,
      address,
      ownerName,
      ownerLastName,
      ownerRut,
      adminEmail,
      adminFirstName,
      adminLastName,
    } = body;

    if (!name || !slug || !billingCycle || !adminEmail || !adminFirstName || !adminLastName) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const org = await managerService.createOrganization(
      {
        name,
        slug,
        billingCycle,
        email,
        phone,
        address,
        ownerName,
        ownerLastName,
        ownerRut,
      },
      {
        email: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
      }
    );

    return NextResponse.json(org);
  } catch (error: any) {
    console.error("[POST /manager/api/centros]", error);
    return NextResponse.json(
      { error: error.message || "Error al crear el centro" },
      { status: 500 }
    );
  }
}
