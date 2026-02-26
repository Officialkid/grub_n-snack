import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isActive must be a boolean' },
        { status: 400 }
      )
    }

    const driver = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, driver })
  } catch (error) {
    console.error('[UPDATE DRIVER ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update driver' },
      { status: 500 }
    )
  }
}
