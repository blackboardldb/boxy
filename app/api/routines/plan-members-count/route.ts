import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFast } from '@/lib/supabase/auth-guard'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminFast(req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const searchParams = req.nextUrl.searchParams
    const planIdsParam = searchParams.get('planIds')
    const planIds = planIdsParam ? planIdsParam.split(',') : []

    if (planIds.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    const count = await prisma.userMembership.count({
      where: {
        organizationId: auth.organizationId,
        planId: { in: planIds },
        status: 'active',
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('[GET /api/routines/plan-members-count]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
