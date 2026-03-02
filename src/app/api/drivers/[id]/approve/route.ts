import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST — Approve driver
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const driver = await prisma.user.findUnique({
      where: { id },
    })

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver not found' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        isPendingApproval: false,
      },
    })

    console.log(`[APPROVE] Driver approved: ${driver.name} (${driver.phone})`)

    return NextResponse.json({
      success: true,
      message: `${driver.name} has been approved and can now log in`,
    })
  } catch (error) {
    console.error('[APPROVE DRIVER ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to approve driver' },
      { status: 500 }
    )
  }
}

// DELETE — Reject and remove driver application
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const driver = await prisma.user.findUnique({
      where: { id },
    })

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver not found' },
        { status: 404 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    console.log(`[REJECT] Driver application rejected and removed: ${driver.name}`)

    return NextResponse.json({
      success: true,
      message: `${driver.name}'s application has been rejected`,
    })
  } catch (error) {
    console.error('[REJECT DRIVER ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to reject application' },
      { status: 500 }
    )
  }
}
