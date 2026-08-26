import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { changePasswordSchema } from "@/lib/schemas";
import { requireAuthFast } from "@/lib/supabase/auth-guard";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/me/change-password
 * Permite al usuario autenticado cambiar su propia contraseña.
 * Body: { currentPassword: string, newPassword: string }
 *
 * Rate-limit: máx 5 intentos fallidos de contraseña actual en 15 min, por
 * (organizationId, userId). Contado vía SystemEvent — sin infra nueva.
 */
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const FAILED_ATTEMPT_TYPE = "password_change_failed";
export async function POST(request: NextRequest) {
  try {
    const parsed = changePasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { currentPassword, newPassword } = parsed.data;

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: "La contraseña actual es obligatoria." },
        { status: 400 }
      );
    }

    // Obtener sesión con guards de tenant (mucho más seguro que getUser() directo)
    const auth = await requireAuthFast(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Rate-limit: bloquear antes de golpear a Supabase si ya hay demasiados fallos recientes.
    // Fail-closed: si dbUserId es null por alguna razón, rechazamos en vez de saltarnos el check.
    const dbUserId = auth.dbUserId;
    if (!dbUserId) {
      return NextResponse.json({ success: false, error: "Error inesperado." }, { status: 500 });
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    const recentFailures = await prisma.systemEvent.count({
      where: {
        organizationId: auth.organizationId,
        type: FAILED_ATTEMPT_TYPE,
        createdAt: { gte: windowStart },
        metadata: { path: ["userId"], equals: dbUserId },
      },
    });

    if (recentFailures >= RATE_LIMIT_MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos fallidos. Intenta de nuevo en unos minutos." },
        { status: 429 }
      );
    }

    // 1. Re-autenticar al usuario para probar posesión de cuenta actual.
    // IMPORTANTE: Se usa un cliente aislado sin persistencia de cookies para no
    // corromper ni invalidar la cookie de sesión activa si la contraseña falla.
    const isolatedSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { error: authError } = await isolatedSupabase.auth.signInWithPassword({
      email: auth.user.email!,
      password: currentPassword,
    });

    if (authError) {
      try {
        await prisma.systemEvent.create({
          data: {
            organizationId: auth.organizationId,
            type: FAILED_ATTEMPT_TYPE,
            message: "Intento fallido de cambio de contraseña: contraseña actual incorrecta.",
            metadata: { userId: auth.dbUserId, email: auth.user.email },
          },
        });
      } catch (auditErr) {
        console.error("[change-password] Error creating SystemEvent (failed attempt):", auditErr);
      }

      // Sin loguear contraseñas y dando solo un mensaje genérico
      return NextResponse.json(
        { success: false, error: "La contraseña actual es incorrecta." },
        { status: 400 }
      );
    }

    // 2. Actualizar contraseña del usuario actual en el cliente de servidor real
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Error interno al actualizar contraseña." },
        { status: 400 }
      );
    }

    // 3. Registrar el evento en el log de auditoría
    try {
      await prisma.systemEvent.create({
        data: {
          organizationId: auth.organizationId,
          type: "password_changed_by_user",
          message: "El usuario cambió su contraseña exitosamente.",
          metadata: { userId: auth.dbUserId, email: auth.user.email }
        }
      });
    } catch (auditErr) {
      console.error("[change-password] Error creating SystemEvent:", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/me/change-password]", error);
    return NextResponse.json(
      { success: false, error: "Error inesperado." },
      { status: 500 }
    );
  }
}
