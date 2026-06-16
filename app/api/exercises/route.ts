import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth-guard'
import { exerciseService } from '@/lib/services/exercise-service'
import { CreateCustomExerciseSchema } from '@/lib/validations/routine-schemas'

// GET /api/exercises
// Devuelve ejercicios globales + custom del centro
// Acepta ?q=query para búsqueda en autocomplete
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { organizationId } = auth

    const query = req.nextUrl.searchParams.get('q')

    const exercises = query
      ? await exerciseService.searchExercises(organizationId, query)
      : await exerciseService.getExercises(organizationId)

    return NextResponse.json(exercises)
  } catch (error: unknown) {
    console.error('[GET /api/exercises]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/exercises
// Crea ejercicio custom del centro — solo ADMIN
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    // requireAdmin permite ADMIN y COACH, así que si solo quieres ADMIN, filtramos acá:
    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo ADMIN puede crear ejercicios custom' }, { status: 403 })
    }

    const { organizationId } = auth

    const body = await req.json()
    const parsed = CreateCustomExerciseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const exercise = await exerciseService.createCustomExercise(
      organizationId,
      parsed.data
    )

    return NextResponse.json(exercise, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Ya existe')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('[POST /api/exercises]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
