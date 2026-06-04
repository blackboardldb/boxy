import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getTenant } from "@/lib/tenant/get-tenant";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  themePrimaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color debe ser hex de 6 dígitos"),
  themeVariant: z.number().int().min(1).max(4),
});

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { organizationId } = await getTenant();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      themePrimaryColor: parsed.data.themePrimaryColor,
      themeVariant: parsed.data.themeVariant,
    },
    select: { themePrimaryColor: true, themeVariant: true },
  });

  return NextResponse.json(updated);
}
