import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOrderSchema } from '@/lib/validations/order'
import type { OrderStatus } from '@/types/order'
import { sendWhatsApp, WhatsAppMessages } from '@/lib/whatsapp'
import { sendPushToAllDrivers } from '@/lib/push'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = createOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        foodItem: data.foodItem,
        vendorName: data.vendorName,
        pickupTime: data.pickupTime,
        deliveryLocation: data.deliveryLocation,
        notes: data.notes ?? null,
        status: 'PENDING',
      },
    })

    // Write status log
    await prisma.orderStatusLog.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: 'PENDING',
        note: 'Order placed by customer',
      },
    })

    try {
      await sendWhatsApp(
        order.customerPhone,
        WhatsAppMessages.orderConfirmed(order.orderNumber, order.customerName)
      )
    } catch (e) {
      console.error('[WHATSAPP CONFIRM ERROR]', e)
    }

    try {
      await sendPushToAllDrivers({
        title: `New Order #${order.orderNumber}`,
        body: `${order.foodItem} from ${order.vendorName} → ${order.deliveryLocation}`,
        url: '/driver/dashboard',
      })
    } catch (e) {
      console.error('[PUSH NEW ORDER ERROR]', e)
    }

    return NextResponse.json(
      {
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[CREATE ORDER ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const orders = await prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('[GET ORDERS ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
