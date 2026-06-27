import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/supabase/auth-guard'
import { prisma } from '@/lib/prisma'

// GET /api/routines/has-routines
// Devuelve { hasRoutines: boolean }
// Usado por el sidebar para mostrar u ocultar la sección Rutinas
export async function GET() {
  try {
    const auth = await requireAuth()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const count = await prisma.routineAssignment.count({
      where: { organizationId: auth.organizationId },
    })

    return NextResponse.json({ hasRoutines: count > 0 })
  } catch (error) {
    console.error('[GET /api/routines/has-routines]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
