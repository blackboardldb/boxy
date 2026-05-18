import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-guard"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { organizationId } = auth
  const { id } = await params

  const registrations = await prisma.classRegistration.findMany({
    where: {
      classId: id,
      status: "registered",
      class: { organizationId }
    },
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  })

  const participants = registrations.map((r: any) => ({
    firstName: r.user.firstName,
    lastName: r.user.lastName
  }))

  return NextResponse.json(participants)
}
