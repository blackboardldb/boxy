import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 1. Buscar en public.users (donde están alumnos/clientes)
    let dbUser: any = await prisma.user.findFirst({
      where: { email: { equals: user.email!, mode: "insensitive" } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        membership: true,
        // Omitimos phone, gender, dateOfBirth para el dashboard inicial (Tarea 2)
      }
    });

    // 2. Si no es un usuario/alumno, buscar en public.instructors (coaches/admin si están ahí)
    if (!dbUser) {
      const instructor = await prisma.instructor.findFirst({
        where: { email: { equals: user.email!, mode: "insensitive" } },
      });
      
      if (instructor) {
        dbUser = {
          id: instructor.id,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          email: instructor.email,
          phone: instructor.phone,
          role: instructor.role || "coach",
          createdAt: instructor.createdAt,
          updatedAt: instructor.updatedAt,
          membership: null,
        };
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Usuario o Instructor no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dbUser });
  } catch (error) {
    console.error("[/api/me] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
