'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '@/lib/useRequireAuth'
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Bike,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'

interface Stats {
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  acceptedOrders: number
  completedOrders: number
  cancelledOrders: number
  activeDrivers: number
  totalDrivers: number
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { status } = useRequireAuth('ADMIN')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchStats(silent = false) {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) setStats(data.stats)
    } catch {
      console.error('Failed to fetch stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') fetchStats()
  }, [status])

  useEffect(() => {
    const interval = setInterval(() => fetchStats(true), 30000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-blue">Overview</h1>
          <p className="text-sm text-gray-500">Live operational snapshot</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm text-brand-orange hover:text-brand-orange/80"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Today section */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Today
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Orders Today"
            value={stats?.todayOrders ?? 0}
            icon={<TrendingUp className="w-5 h-5 text-brand-orange" />}
            color="bg-brand-orange/10"
          />
          <StatCard
            label="Pending"
            value={stats?.pendingOrders ?? 0}
            icon={<Clock className="w-5 h-5 text-yellow-500" />}
            color="bg-yellow-50"
          />
          <StatCard
            label="In Progress"
            value={stats?.acceptedOrders ?? 0}
            icon={<Bike className="w-5 h-5 text-blue-500" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Completed"
            value={stats?.completedOrders ?? 0}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            color="bg-green-50"
          />
        </div>
      </div>

      {/* All time section */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          All Time
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Orders"
            value={stats?.totalOrders ?? 0}
            icon={<ShoppingBag className="w-5 h-5 text-purple-500" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Cancelled"
            value={stats?.cancelledOrders ?? 0}
            icon={<XCircle className="w-5 h-5 text-red-500" />}
            color="bg-red-50"
          />
          <StatCard
            label="Drivers On Duty"
            value={stats?.activeDrivers ?? 0}
            icon={<Bike className="w-5 h-5 text-green-500" />}
            color="bg-green-50"
          />
          <StatCard
            label="Total Drivers"
            value={stats?.totalDrivers ?? 0}
            icon={<Users className="w-5 h-5 text-gray-500" />}
            color="bg-gray-100"
          />
        </div>
      </div>

    </div>
  )
}
