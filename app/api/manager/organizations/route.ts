import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { managerService } from "@/lib/services/manager-service";
import { ErrorHandler } from "@/lib/errors/handler";
import { z } from "zod";

const createOrganizationSchema = z.object({
  name: z.string().min(1, "name es requerido"),
  slug: z.string().min(1, "slug es requerido"),
  adminEmail: z.string().email("adminEmail debe ser un email válido"),
  adminFirstName: z.string().min(1, "adminFirstName es requerido"),
  adminLastName: z.string().min(1, "adminLastName es requerido"),
  billingCycle: z.string().optional(),
});

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

    const parsed = createOrganizationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { name, slug, billingCycle, adminEmail, adminFirstName, adminLastName } = parsed.data;

    const org = await managerService.createOrganization(
      { name, slug, billingCycle: billingCycle ?? "A" },
      { email: adminEmail, firstName: adminFirstName, lastName: adminLastName }
    );

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    return ErrorHandler.createResponse(error, {
      operation: "createOrganization",
      resource: "organizations",
    });
  }
}
