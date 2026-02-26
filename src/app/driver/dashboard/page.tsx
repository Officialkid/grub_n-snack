'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '@/lib/useRequireAuth'
import OrderCard from '@/components/OrderCard'
import DutyToggle from '@/components/DutyToggle'
import SignOutButton from '@/components/SignOutButton'
import { Order } from '@/types/order'
import { RefreshCw } from 'lucide-react'
import PushNotificationSetup from '@/components/PushNotificationSetup'

type FilterTab = 'available' | 'mine' | 'completed'

export default function DriverDashboardPage() {
  const { session, status } = useRequireAuth('DRIVER')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('available')
  const [isOnDuty, setIsOnDuty] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.orders)
        setLastUpdated(new Date())
      }
    } catch {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status, fetchOrders])

  // Auto-refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 20000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Failed to update order')
        return
      }

      // Refresh orders after update
      await fetchOrders(true)
    } catch {
      alert('Network error. Please try again.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  const driverId = session?.user?.id ?? ''

  const availableOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'RELEASED'
  )

  const myActiveOrders = orders.filter(
    (o) =>
      o.driverId === driverId &&
      ['ACCEPTED', 'PICKED', 'DELIVERED'].includes(o.status)
  )

  const myCompletedOrders = orders.filter(
    (o) => o.driverId === driverId && o.status === 'COMPLETED'
  )

  const tabOrders =
    activeTab === 'available'
      ? availableOrders
      : activeTab === 'mine'
      ? myActiveOrders
      : myCompletedOrders

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'available', label: 'Available', count: availableOrders.length },
    { key: 'mine', label: 'My Orders', count: myActiveOrders.length },
    { key: 'completed', label: 'Completed', count: myCompletedOrders.length },
  ]

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-brand-blue border-b border-brand-blue px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-brand-orange">Grub N Snack</h1>
            <p className="text-xs text-white/60">Hi, {session?.user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <DutyToggle
              initialIsOnDuty={isOnDuty}
              onToggle={setIsOnDuty}
            />
            <SignOutButton className="text-sm text-white/60 hover:text-red-400 transition-colors" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-lg mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-brand-orange/20 text-brand-orange'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">

        {/* Push notification prompt */}
        <PushNotificationSetup />

        {/* Refresh bar */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {lastUpdated
              ? `Updated just now · Auto-refreshes every 20s`
              : 'Loading...'}
          </span>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-1 text-brand-orange hover:text-brand-orange/80"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Order list */}
        {tabOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">
              {activeTab === 'available' && 'No available orders right now'}
              {activeTab === 'mine' && 'No active orders assigned to you'}
              {activeTab === 'completed' && 'No completed orders yet'}
            </p>
          </div>
        ) : (
          tabOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              driverId={driverId}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        )}

      </div>
    </main>
  )
}
