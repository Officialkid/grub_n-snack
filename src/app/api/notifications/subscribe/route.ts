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
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription object' },
        { status: 400 }
      )
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUSH SUBSCRIBE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { endpoint } = body

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUSH UNSUBSCRIBE ERROR]', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}
