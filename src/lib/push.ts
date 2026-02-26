import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload {
  title: string
  body: string
  url?: string
}

export async function sendPushToAllDrivers(payload: PushPayload) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      include: {
        user: {
          select: { isActive: true, isOnDuty: true, role: true },
        },
      },
    })

    const activeDriverSubs = subscriptions.filter(
      (sub) =>
        sub.user.isActive &&
        sub.user.isOnDuty &&
        sub.user.role === 'DRIVER'
    )

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
      console.warn(`[PUSH] ${failed.length} push(es) failed out of ${activeDriverSubs.length}`)
    }

    console.log(`[PUSH] Sent to ${activeDriverSubs.length - failed.length} drivers`)
  } catch (error) {
    console.error('[PUSH SEND ERROR]', error)
  }
}

export async function sendPushToDriver(driverId: string, payload: PushPayload) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: driverId },
    })

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
