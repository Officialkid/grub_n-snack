'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      if (Notification.permission === 'granted') {
        setSubscribed(true)
      }
    }
  }, [])

  async function handleSubscribe() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      if (res.ok) {
        setSubscribed(true)
        setPermission('granted')
      }
    } catch (error) {
      console.error('[PUSH SUBSCRIBE ERROR]', error)
    } finally {
      setLoading(false)
    }
  }

  // Already subscribed or dismissed — show nothing or minimal indicator
  if (subscribed) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600">
        <Bell className="w-3.5 h-3.5" />
        Notifications on
      </div>
    )
  }

  if (dismissed || permission === 'denied') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <BellOff className="w-3.5 h-3.5" />
        Notifications off
      </div>
    )
  }

  // Prompt banner
  return (
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-3 flex items-start gap-3">
      <Bell className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">Enable order notifications</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Get notified instantly when new orders arrive
        </p>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-2 bg-brand-orange hover:bg-brand-orange/90 disabled:bg-brand-orange/50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading ? 'Enabling...' : 'Enable Notifications'}
        </button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-gray-600 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
