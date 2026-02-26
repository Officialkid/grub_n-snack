'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { Order, OrderStatus } from '@/types/order'
import { formatDistanceToNow, format } from 'date-fns'
import { RefreshCw, Search, X } from 'lucide-react'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RELEASED', label: 'Released' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'PICKED', label: 'Picked' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  RELEASED: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PICKED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
}

export default function AdminOrdersPage() {
  const { status } = useRequireAuth('ADMIN')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const url = statusFilter
        ? `/api/orders?status=${statusFilter}`
        : '/api/orders'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setOrders(data.orders)
    } catch {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (status === 'authenticated') fetchOrders()
  }, [status, fetchOrders])

  async function handleCancel(orderId: string) {
    if (!confirm('Cancel this order? This cannot be undone.')) return
    setCancellingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', note: 'Cancelled by admin' }),
      })
      if (res.ok) {
        await fetchOrders(true)
        if (selectedOrder?.id === orderId) setSelectedOrder(null)
      }
    } catch {
      alert('Failed to cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.vendorName.toLowerCase().includes(q) ||
      String(o.orderNumber).includes(q)
    )
  })

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-blue">Orders</h1>
          <p className="text-sm text-gray-500">{filteredOrders.length} orders shown</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-sm text-brand-orange hover:text-brand-orange/80"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, vendor or order #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Placed</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-700">#{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{order.customerName}</div>
                      <div className="text-xs text-gray-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{order.vendorName}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {order.driver ? (
                        <span className="text-gray-700">{order.driver.name}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs text-brand-orange hover:text-brand-orange/80 font-medium"
                        >
                          View
                        </button>
                        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={cancellingId === order.id}
                            className="text-xs text-red-400 hover:text-red-600 font-medium"
                          >
                            {cancellingId === order.id ? '...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-medium text-gray-800">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Food Item</p>
                  <p className="font-medium text-gray-800">{selectedOrder.foodItem}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Vendor</p>
                  <p className="font-medium text-gray-800">{selectedOrder.vendorName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pickup Time</p>
                  <p className="font-medium text-gray-800">{selectedOrder.pickupTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400">Delivery Location</p>
                <p className="font-medium text-gray-800">{selectedOrder.deliveryLocation}</p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-gray-400">Notes</p>
                  <p className="text-gray-600 italic">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.driver && (
                <div>
                  <p className="text-xs text-gray-400">Assigned Driver</p>
                  <p className="font-medium text-gray-800">
                    {selectedOrder.driver.name} · {selectedOrder.driver.phone}
                  </p>
                </div>
              )}

              <div className="border-t pt-3 space-y-1">
                <p className="text-xs text-gray-400">Timeline</p>
                <p className="text-xs text-gray-600">
                  Placed: {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy, h:mm a')}
                </p>
                {selectedOrder.acceptedAt && (
                  <p className="text-xs text-gray-600">
                    Accepted: {format(new Date(selectedOrder.acceptedAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                )}
                {selectedOrder.pickedAt && (
                  <p className="text-xs text-gray-600">
                    Picked: {format(new Date(selectedOrder.pickedAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                )}
                {selectedOrder.deliveredAt && (
                  <p className="text-xs text-gray-600">
                    Delivered: {format(new Date(selectedOrder.deliveredAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                )}
                {selectedOrder.completedAt && (
                  <p className="text-xs text-gray-600">
                    Completed: {format(new Date(selectedOrder.completedAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {selectedOrder.status !== 'CANCELLED' &&
                selectedOrder.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCancel(selectedOrder.id)}
                    disabled={cancellingId === selectedOrder.id}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg py-2.5 text-sm transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
