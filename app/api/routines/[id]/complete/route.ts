import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { routineService } from '@/lib/services/routine-service'
import { CompleteRoutineSchema } from '@/lib/validations/routine-schemas'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// POST /api/routines/[id]/complete
// El alumno marca su rutina como completada
// Cualquier rol puede completar — el servicio valida que esté asignado
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { user } = auth
    const { id } = await params

    const body = await req.json()
    const parsed = CompleteRoutineSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Resolvemos el CUID de Prisma a partir del authId
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    })
    
    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const result = await routineService.completeAssignment(
      id,
      dbUser.id,
      parsed.data
    )

    return NextResponse.json(result)
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('no tienes')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('ya fue marcada')) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }
    console.error('[POST /api/routines/[id]/complete]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
