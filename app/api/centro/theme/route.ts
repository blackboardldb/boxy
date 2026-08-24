import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminFast } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    themePrimaryColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Color debe ser hex de 6 dígitos")
      .optional(),
    themeVariant: z.number().int().min(1).max(4).optional(),
    themeMode: z.enum(["light", "dark"]).optional(),
  })
  .refine(
    (data) =>
      data.themePrimaryColor !== undefined ||
      data.themeVariant !== undefined ||
      data.themeMode !== undefined,
    { message: "Debe enviarse al menos un campo a actualizar" }
  );

export async function PATCH(request: NextRequest) {
  // Guard migrado de lib/auth/require-admin (legacy, basado en redirect()) al
  // guard canónico del proyecto — expone organizationId del token y no depende
  // de getTenant() / Host header, cerrando la ventana de tenant-spoofing vía URL.
  const auth = await requireAdminFast(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Sólo administradores pueden editar el tema" }, { status: 403 });
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

  try {
    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        themePrimaryColor: parsed.data.themePrimaryColor,
        themeVariant: parsed.data.themeVariant,
        themeMode: parsed.data.themeMode,
      },
      select: { themePrimaryColor: true, themeVariant: true, themeMode: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[/api/centro/theme] Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
