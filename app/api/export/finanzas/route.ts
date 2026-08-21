import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFast } from '@/lib/supabase/auth-guard'
import { prisma } from '@/lib/prisma'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminFast(req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Últimos 12 meses en orden cronológico
    const months = Array.from({ length: 12 }).map((_, i) => {
      const d = subMonths(new Date(), 11 - i)
      return {
        start: startOfMonth(d),
        end: endOfMonth(d),
        label: format(d, 'yyyy-MM'),
      }
    })

    let csv = 'Mes,Ingresos,Egresos,Renovaciones\n'

    for (const { start, end, label } of months) {
      const [ingresos, egresos, count] = await Promise.all([
        // Ingresos: MembershipRenewal aprobadas — campo de fecha: requestedAt, monto: amount (Float?)
        prisma.membershipRenewal.aggregate({
          where: {
            organizationId: auth.organizationId,
            requestedAt: { gte: start, lte: end },
            status: 'approved',
          },
          _sum: { amount: true },
        }),
        // Egresos: Expense — campo de fecha: fecha, monto: monto (no 'amount')
        prisma.expense.aggregate({
          where: {
            organizationId: auth.organizationId,
            fecha: { gte: start, lte: end },
          },
          _sum: { monto: true },
        }),
        // Cantidad de renovaciones aprobadas del mes
        prisma.membershipRenewal.count({
          where: {
            organizationId: auth.organizationId,
            requestedAt: { gte: start, lte: end },
            status: 'approved',
          },
        }),
      ])

      csv += `${label},${ingresos._sum.amount ?? 0},${egresos._sum.monto ?? 0},${count}\n`
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="finanzas_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('[GET /api/export/finanzas]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
