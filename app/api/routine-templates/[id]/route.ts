import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth-guard'
import { routineService } from '@/lib/services/routine-service'
import { UpdateRoutineTemplateSchema } from '@/lib/validations/routine-schemas'

type Params = { params: Promise<{ id: string }> }

// PUT /api/routine-templates/[id]
// Editar template — COACH edita los suyos, ADMIN edita todos
// La restricción de "solo los suyos" se maneja en el servicio vía createdByUserId
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { organizationId } = auth
    const { id } = await params

    const body = await req.json()
    const parsed = UpdateRoutineTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const template = await routineService.updateTemplate(
      organizationId,
      id,
      parsed.data
    )

    return NextResponse.json(template)
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('no encontrado')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }
    console.error('[PUT /api/routine-templates/[id]]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/routine-templates/[id]
// Soft delete — solo ADMIN
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo ADMIN puede eliminar templates' }, { status: 403 })
    }

    const { organizationId } = auth
    const { id } = await params

    await routineService.deleteTemplate(organizationId, id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('no encontrado')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }
    console.error('[DELETE /api/routine-templates/[id]]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
