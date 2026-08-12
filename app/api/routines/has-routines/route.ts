import { NextRequest, NextResponse } from 'next/server'
import { requireAuthFast } from '@/lib/supabase/auth-guard'
import { prisma } from '@/lib/prisma'

// GET /api/routines/has-routines
// Devuelve { hasRoutines: boolean }
// Usado por el sidebar para mostrar u ocultar la sección Rutinas
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthFast(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const activeOrgId = auth.organizationId
    if (!activeOrgId) {
      return NextResponse.json({ error: "Tenant no resuelto" }, { status: 400 })
    }

    const count = await prisma.routineAssignment.count({
      where: { organizationId: activeOrgId },
    })

    return NextResponse.json({ hasRoutines: count > 0 })
  } catch (error) {
    console.error('[GET /api/routines/has-routines]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
