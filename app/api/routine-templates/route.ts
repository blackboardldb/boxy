import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/auth-guard'
import { routineService } from '@/lib/services/routine-service'
import { CreateRoutineTemplateSchema } from '@/lib/validations/routine-schemas'
import { prisma } from '@/lib/prisma'

// GET /api/routine-templates
// Lista todos los templates activos del centro
export async function GET() {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { organizationId } = auth

    const templates = await routineService.getTemplates(organizationId)

    return NextResponse.json(templates)
  } catch (error: unknown) {
    console.error('[GET /api/routine-templates]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/routine-templates
// Crea un template nuevo — COACH o ADMIN
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { organizationId, user } = auth

    // Obtener el ID interno de Prisma (CUID) a partir del Auth ID de Supabase
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = CreateRoutineTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const template = await routineService.createTemplate(
      organizationId,
      dbUser.id,
      parsed.data
    )

    return NextResponse.json(template, { status: 201 })
  } catch (error: unknown) {
    console.error('[POST /api/routine-templates]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
