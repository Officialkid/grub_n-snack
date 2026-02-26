import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsApp, WhatsAppMessages } from '@/lib/whatsapp'
import { subMinutes } from 'date-fns'

// This route is called by a cron job every 5 minutes
// Vercel cron or external cron service hits: GET /api/notifications/pending-check
// Protect with a shared secret header

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const fifteenMinutesAgo = subMinutes(new Date(), 15)

    // Find orders pending for 15+ minutes that have not had a reminder sent yet
    const staleOrders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'RELEASED'] },
        createdAt: { lte: fifteenMinutesAgo },
        reminderSentAt: null,
      },
    })

    console.log(`[PENDING CHECK] Found ${staleOrders.length} stale orders`)

    for (const order of staleOrders) {
      try {
        await sendWhatsApp(
          order.customerPhone,
          WhatsAppMessages.orderPendingReminder(order.orderNumber)
        )

        await prisma.order.update({
          where: { id: order.id },
          data: { reminderSentAt: new Date() },
        })

        console.log(`[PENDING CHECK] Reminder sent for order #${order.orderNumber}`)
      } catch (e) {
        console.error(`[PENDING CHECK] Failed for order #${order.orderNumber}`, e)
      }
    }

    return NextResponse.json({
      success: true,
      checked: staleOrders.length,
    })
  } catch (error) {
    console.error('[PENDING CHECK ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Pending check failed' },
      { status: 500 }
    )
  }
}
