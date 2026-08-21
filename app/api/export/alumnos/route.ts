import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFast } from '@/lib/supabase/auth-guard'
import { prisma } from '@/lib/prisma'

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toRow(fields: string[]): string {
  return fields.map(csvEscape).join(',') + '\n'
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminFast(req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Paso 1: obtener todos los alumnos del centro con sus datos de usuario
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: auth.organizationId, role: 'ALUMNO' },
      include: { user: true },
    })

    // Paso 2: obtener la membresía de cada alumno (@@id([userId, organizationId]) → 1:1 garantizado)
    const userIds = members.map(m => m.userId)
    const memberships = await prisma.userMembership.findMany({
      where: {
        organizationId: auth.organizationId,
        userId: { in: userIds },
      },
      include: { plan: true },
    })

    // Indexar por userId para lookup O(1) en el loop
    const membershipByUserId = new Map(memberships.map(m => [m.userId, m]))

    let csv = toRow(['Nombre', 'Apellido', 'Email', 'Teléfono', 'Fecha Ingreso', 'Último Plan', 'Estado Plan', 'Vencimiento'])

    for (const m of members) {
      const membership = membershipByUserId.get(m.userId)
      csv += toRow([
        m.user.firstName ?? '',
        m.user.lastName ?? '',
        m.user.email ?? '',
        m.user.phone ?? '',
        // joinedAt vive en OrganizationMember, no en User
        m.joinedAt.toISOString().split('T')[0],
        membership?.plan?.name ?? 'Sin plan',
        membership?.status ?? '-',
        membership?.currentPeriodEnd?.toISOString().split('T')[0] ?? '-',
      ])
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="alumnos_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('[GET /api/export/alumnos]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
