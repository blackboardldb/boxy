import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/require-manager";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { rethrowIfRedirect } from "@/lib/utils/next-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    // 1. Límite de tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo excede el límite de 2MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Magic Bytes Validation (PNG: 89 50 4E 47 0D 0A 1A 0A)
    if (buffer.length < 8) {
      return NextResponse.json({ error: "Archivo inválido o corrupto" }, { status: 400 });
    }

    const pngMagicBytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    for (let i = 0; i < pngMagicBytes.length; i++) {
      if (buffer[i] !== pngMagicBytes[i]) {
        return NextResponse.json(
          { error: "Formato inválido. Solo se admiten archivos PNG reales." },
          { status: 400 }
        );
      }
    }

    // 3. Dimensiones máximas (parseando chunks IHDR)
    // El chunk IHDR comienza en el byte 8 (después de la firma de 8 bytes).
    // Estructura: 4 bytes length, 4 bytes type ('IHDR'), 4 bytes width, 4 bytes height.
    // O sea, el width está en el offset 16 y el height en el offset 20.
    if (buffer.length < 24) {
      return NextResponse.json({ error: "Archivo PNG incompleto" }, { status: 400 });
    }

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    const MAX_DIMENSION = 2048; // Max 2048x2048 px
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      return NextResponse.json(
        { error: `Las dimensiones de la imagen (${width}x${height}) exceden el máximo permitido de ${MAX_DIMENSION}px.` },
        { status: 400 }
      );
    }

    // 4. Subida a Supabase Storage
    const supabase = createAdminClient();
    const filePath = `${id}/icon.png`;

    const { error: uploadError } = await supabase.storage
      .from("orgs")
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("orgs")
      .getPublicUrl(filePath);

    const customIconUrl = publicUrlData.publicUrl;

    // 5. Actualizar la base de datos
    await prisma.organization.update({
      where: { id },
      data: { customIconUrl },
    });

    return NextResponse.json({ success: true, customIconUrl });
  } catch (error: any) {
    rethrowIfRedirect(error);
    console.error("[POST /manager/api/centros/[id]/branding]", error);
    return NextResponse.json(
      { error: error.message || "Error al subir el logo" },
      { status: 500 }
    );
  }
}
