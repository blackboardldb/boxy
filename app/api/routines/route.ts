import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/supabase/auth-guard'
import { routineService } from '@/lib/services/routine-service'
import { prisma } from '@/lib/prisma'
import {
  CreateRoutineAssignmentSchema,
  CreateRoutineWeekSchema,
  GetRoutinesQuerySchema,
} from '@/lib/validations/routine-schemas'

// GET /api/routines?from=YYYY-MM-DD&to=YYYY-MM-DD&userId=optional
// Admin/Coach → ve todos los assignments del rango
// Alumno → ve solo los suyos
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { organizationId, user, role } = auth

    const searchParams = req.nextUrl.searchParams
    const rawQuery = {
      from:   searchParams.get('from') ?? '',
      to:     searchParams.get('to') ?? '',
      userId: searchParams.get('userId') ?? undefined,
    }

    const parsed = GetRoutinesQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const isCoachOrAdmin = role === 'ADMIN' || role === 'COACH'

    if (isCoachOrAdmin) {
      const assignments = await routineService.getAssignments(
        organizationId,
        parsed.data
      )
      return NextResponse.json(assignments)
    }

    // Alumno — solo ve las suyas
    // Obtenemos el ID interno de Prisma
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const assignments = await routineService.getAssignmentsForMember(
      organizationId,
      dbUser.id,
      parsed.data
    )
    return NextResponse.json(assignments)
  } catch (error: unknown) {
    console.error('[GET /api/routines]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/routines
// Crear assignment — modo día o modo semana
// Body diferenciado por campo "mode": "day" | "week"
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { organizationId, user } = auth

    // Obtenemos el ID interno de Prisma para el creador
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const mode = body.mode as string

    if (mode === 'week') {
      const parsed = CreateRoutineWeekSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const assignments = await routineService.createWeekAssignments(
        organizationId,
        dbUser.id,
        parsed.data
      )

      return NextResponse.json(assignments, { status: 201 })
    }

    // Modo día por defecto
    const parsed = CreateRoutineAssignmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const assignment = await routineService.createAssignment(
      organizationId,
      dbUser.id,
      parsed.data
    )

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('no pertenecen al centro')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    console.error('[POST /api/routines]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
