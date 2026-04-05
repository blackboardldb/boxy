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
        phone: true,
        gender: true,
        dateOfBirth: true,
        emergencyContact: true,
        membership: true,
      }
    });

    // 2. Si no es un usuario/alumno, buscar en public.instructors (coaches/admin si están ahí)
    if (!dbUser) {
      const instructor = await prisma.instructor.findFirst({
        where: { email: { equals: user.email!, mode: "insensitive" } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      
      if (instructor) {
        dbUser = {
          id: instructor.id,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          email: instructor.email,
          role: (instructor as any).role || "coach",
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

    // 3. Promoción automática de plan 'scheduled' a 'active' (Solo para usuarios con membresía)
    if (dbUser.membership) {
        const membership = dbUser.membership as any;
        const now = new Date();
        
        // 3.1 Verificar si el plan principal necesita reemplazo (vencido o inactivo)
        const principalEndStr = membership.currentPeriodEnd;
        const principalEnd = principalEndStr 
          ? new Date(principalEndStr.substring(0, 10) + "T23:59:59")
          : null;
        
        const principalIsExpired = principalEnd && now > principalEnd;
        const principalIsInactive = ["inactive", "expired"].includes(membership.status);

        // 3.2 Si necesita promoción, buscar plan 'scheduled' listo en el historial para activarse hoy
        if ((principalIsExpired || principalIsInactive) && Array.isArray(membership.history)) {
          const readyPlanIndex = membership.history.findIndex((plan: any) => {
            if (plan.status !== "scheduled") return false;
            const startStr = plan.currentPeriodStart || plan.startDate;
            if (!startStr) return false;
            // Un plan está listo si su fecha de inicio es igual o anterior a hoy
            const startDate = new Date(startStr.substring(0, 10) + "T00:00:00");
            return now >= startDate;
          });

          if (readyPlanIndex !== -1) {
            const readyPlan = membership.history[readyPlanIndex];
            
            // Archivar el principal actual (que está vencido/inactivo)
            const oldMembershipForHistory = { ...membership };
            delete oldMembershipForHistory.history;
            oldMembershipForHistory.status = "inactive";

            // Limpiar planes del historial
            const remainingHistory = membership.history.filter((_: any, i: number) => i !== readyPlanIndex);
            
            // Construir el nuevo objeto principal
            const promotedMembership = {
              ...readyPlan,
              status: "active",
              history: [oldMembershipForHistory, ...remainingHistory]
            };

            // 3.3 Persistir en Base de Datos (Prisma)
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { membership: promotedMembership as any }
            });

            // Actualizar objeto en memoria para la respuesta inmediata
            dbUser.membership = promotedMembership;
          }
        }
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
