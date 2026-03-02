import { prisma } from '@/lib/prisma'

export interface PushPayload {
  title: string
  body: string
  url?: string
}

export async function sendPushToAllDrivers(payload: PushPayload) {
  try {
    const webpush = (await import('web-push')).default

    const mailto = process.env.VAPID_MAILTO
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!mailto || !publicKey || !privateKey) {
      console.warn('[PUSH] VAPID environment variables not set — skipping push')
      return
    }

    webpush.setVapidDetails(mailto, publicKey, privateKey)

    const subscriptions = await prisma.pushSubscription.findMany({
      include: {
        user: {
          select: {
            isActive: true,
            isOnDuty: true,
            role: true,
          },
        },
      },
    })

    const activeDriverSubs = subscriptions.filter(
      (sub) =>
        sub.user.isActive &&
        sub.user.isOnDuty &&
        sub.user.role === 'DRIVER'
    )

    if (activeDriverSubs.length === 0) {
      console.log('[PUSH] No active on-duty drivers to notify')
      return
    }

    const results = await Promise.allSettled(
      activeDriverSubs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload)
        )
      )
    )

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length > 0) {
      console.warn(
        `[PUSH] ${failed.length} failed out of ${activeDriverSubs.length}`
      )
    } else {
      console.log(`[PUSH] Sent to ${activeDriverSubs.length} drivers`)
    }
  } catch (error) {
    console.error('[PUSH SEND ERROR]', error)
  }
}

export async function sendPushToDriver(
  driverId: string,
  payload: PushPayload
) {
  try {
    const webpush = (await import('web-push')).default

    const mailto = process.env.VAPID_MAILTO
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!mailto || !publicKey || !privateKey) {
      console.warn('[PUSH] VAPID environment variables not set — skipping push')
      return
    }

    webpush.setVapidDetails(mailto, publicKey, privateKey)

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: driverId },
    })

    if (subscriptions.length === 0) return

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload)
        )
      )
    )
  } catch (error) {
    console.error('[PUSH SEND TO DRIVER ERROR]', error)
  }
}
