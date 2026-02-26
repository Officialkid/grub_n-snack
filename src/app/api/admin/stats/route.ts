import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      acceptedOrders,
      completedOrders,
      cancelledOrders,
      activeDrivers,
      totalDrivers,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.order.count({ where: { status: { in: ['PENDING', 'RELEASED'] } } }),
      prisma.order.count({
        where: { status: { in: ['ACCEPTED', 'PICKED', 'DELIVERED'] } },
      }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.user.count({ where: { role: 'DRIVER', isOnDuty: true, isActive: true } }),
      prisma.user.count({ where: { role: 'DRIVER', isActive: true } }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        acceptedOrders,
        completedOrders,
        cancelledOrders,
        activeDrivers,
        totalDrivers,
      },
    })
  } catch (error) {
    console.error('[ADMIN STATS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
