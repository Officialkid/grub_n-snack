import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { isOnDuty } = body

    if (typeof isOnDuty !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isOnDuty must be a boolean' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { isOnDuty },
      select: {
        id: true,
        name: true,
        isOnDuty: true,
      },
    })

    return NextResponse.json({ success: true, driver: updated })
  } catch (error) {
    console.error('[DUTY TOGGLE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update duty status' },
      { status: 500 }
    )
  }
}
