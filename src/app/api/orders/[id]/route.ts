import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { OrderStatus } from '@/types/order'
import { sendWhatsApp, WhatsAppMessages } from '@/lib/whatsapp'
import { sendPushToDriver } from '@/lib/push'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params
    const body = await req.json()
    const { status, note } = body
    const userId = session.user.id

    // Fetch current order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    const fromStatus = order.status
    const updateData: Record<string, unknown> = { status }

    // ACCEPT — must be PENDING or RELEASED, uses atomic update to prevent race condition
    if (status === 'ACCEPTED') {
      const updated = await prisma.order.updateMany({
        where: {
          id: orderId,
          status: { in: ['PENDING', 'RELEASED'] },
        },
        data: {
          status: 'ACCEPTED',
          driverId: userId,
          acceptedAt: new Date(),
        },
      })

      if (updated.count === 0) {
        return NextResponse.json(
          { success: false, message: 'Order already taken by another driver' },
          { status: 409 }
        )
      }

      await prisma.orderStatusLog.create({
        data: {
          orderId,
          changedBy: userId,
          fromStatus,
          toStatus: 'ACCEPTED',
          note: note ?? 'Driver accepted order',
        },
      })

      const acceptedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { driver: { select: { name: true, phone: true } } },
      })

      if (acceptedOrder?.driver) {
        try {
          await sendWhatsApp(
            acceptedOrder.customerPhone,
            WhatsAppMessages.driverAssigned(
              acceptedOrder.orderNumber,
              acceptedOrder.driver.name,
              acceptedOrder.driver.phone
            )
          )
        } catch (e) {
          console.error('[WHATSAPP DRIVER ASSIGNED ERROR]', e)
        }
      }

      return NextResponse.json({ success: true, message: 'Order accepted' })
    }

    // RELEASE — driver returns order to pool
    if (status === 'RELEASED') {
      if (order.driverId !== userId && session.user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'Not your order' }, { status: 403 })
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'RELEASED',
          driverId: null,
          acceptedAt: null,
        },
      })

      await prisma.orderStatusLog.create({
        data: {
          orderId,
          changedBy: userId,
          fromStatus,
          toStatus: 'RELEASED',
          note: note ?? 'Driver released order back to pool',
        },
      })

      return NextResponse.json({ success: true, message: 'Order released' })
    }

    // PICKED
    if (status === 'PICKED') {
      if (order.driverId !== userId) {
        return NextResponse.json({ success: false, message: 'Not your order' }, { status: 403 })
      }
      updateData.pickedAt = new Date()
      try {
        await sendWhatsApp(
          order.customerPhone,
          WhatsAppMessages.orderPicked(order.orderNumber)
        )
      } catch (e) {
        console.error('[WHATSAPP PICKED ERROR]', e)
      }
    }

    // DELIVERED
    if (status === 'DELIVERED') {
      if (order.driverId !== userId) {
        return NextResponse.json({ success: false, message: 'Not your order' }, { status: 403 })
      }
      updateData.deliveredAt = new Date()
      try {
        await sendWhatsApp(
          order.customerPhone,
          WhatsAppMessages.orderDelivered(order.orderNumber)
        )
      } catch (e) {
        console.error('[WHATSAPP DELIVERED ERROR]', e)
      }
    }

    // COMPLETED
    if (status === 'COMPLETED') {
      if (order.driverId !== userId) {
        return NextResponse.json({ success: false, message: 'Not your order' }, { status: 403 })
      }
      updateData.completedAt = new Date()
    }

    // CANCELLED — admin only
    if (status === 'CANCELLED') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'Admin only' }, { status: 403 })
      }
      updateData.cancelledAt = new Date()
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    await prisma.orderStatusLog.create({
      data: {
        orderId,
        changedBy: userId,
        fromStatus,
        toStatus: status as OrderStatus,
        note: note ?? null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[UPDATE ORDER STATUS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
