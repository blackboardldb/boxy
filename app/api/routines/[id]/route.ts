import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth-guard'
import { routineService } from '@/lib/services/routine-service'

type Params = { params: Promise<{ id: string }> }

// DELETE /api/routines/[id]
// Elimina el assignment y sus members en cascade
// Solo COACH que lo creó o ADMIN
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { organizationId } = auth
    const { id } = await params

    await routineService.deleteAssignment(organizationId, id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('no encontrada')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }
    console.error('[DELETE /api/routines/[id]]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
