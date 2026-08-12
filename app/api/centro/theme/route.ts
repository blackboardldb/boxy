import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  themePrimaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color debe ser hex de 6 dígitos"),
  themeVariant: z.number().int().min(1).max(4),
});

export async function PATCH(request: NextRequest) {
  // Guard migrado de lib/auth/require-admin (legacy, basado en redirect()) al
  // guard canónico del proyecto — expone organizationId del token y no depende
  // de getTenant() / Host header, cerrando la ventana de tenant-spoofing vía URL.
  const auth = await requireAdminFast(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { organizationId } = auth;

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
