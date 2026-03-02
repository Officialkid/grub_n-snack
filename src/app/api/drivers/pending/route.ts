import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const drivers = await prisma.user.findMany({
      where: {
        role: 'DRIVER',
        isPendingApproval: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, drivers })
  } catch (error) {
    console.error('[PENDING DRIVERS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pending drivers' },
      { status: 500 }
    )
  }
}
