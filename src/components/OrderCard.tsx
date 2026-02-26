'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MapPin, Clock, Store, UtensilsCrossed, Phone, FileText } from 'lucide-react'
import { Order } from '@/types/order'

interface OrderCardProps {
  order: Order
  driverId: string
  onStatusUpdate: (orderId: string, status: string) => Promise<void>
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  RELEASED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-700 border-blue-200',
  PICKED: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
}

export default function OrderCard({ order, driverId, onStatusUpdate }: OrderCardProps) {
  const [loading, setLoading] = useState(false)

  const isMyOrder = order.driverId === driverId
  const isAvailable = order.status === 'PENDING' || order.status === 'RELEASED'
  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })

  async function handleAction(status: string) {
    setLoading(true)
    await onStatusUpdate(order.id, status)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-lg font-bold text-gray-800">#{order.orderNumber}</span>
          <span className="ml-2 text-sm text-gray-500">{order.customerName}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Time placed */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        <span>Placed {timeAgo}</span>
      </div>

      {/* Order details */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <UtensilsCrossed className="w-4 h-4 mt-0.5 text-brand-orange shrink-0" />
          <span>{order.foodItem}</span>
        </div>
        <div className="flex items-start gap-2">
          <Store className="w-4 h-4 mt-0.5 text-brand-orange shrink-0" />
          <span>{order.vendorName} · Pickup {order.pickupTime}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 text-brand-orange shrink-0" />
          <span>{order.deliveryLocation}</span>
        </div>
        <div className="flex items-start gap-2">
          <Phone className="w-4 h-4 mt-0.5 text-brand-orange shrink-0" />
          <span>{order.customerPhone}</span>
        </div>
        {order.notes && (
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-0.5 text-brand-orange shrink-0" />
            <span className="text-gray-500 italic">{order.notes}</span>
          </div>
        )}
      </div>

      {/* Assigned driver info */}
      {order.driver && !isMyOrder && (
        <div className="text-xs text-gray-400 border-t pt-2">
          Assigned to {order.driver.name}
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-1">
        {isAvailable && (
          <button
            onClick={() => handleAction('ACCEPTED')}
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 disabled:bg-brand-orange/50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Accepting...' : 'Accept Order'}
          </button>
        )}

        {isMyOrder && order.status === 'ACCEPTED' && (
          <div className="space-y-2">
            <button
              onClick={() => handleAction('PICKED')}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              {loading ? 'Updating...' : 'Mark as Picked Up'}
            </button>
            <button
              onClick={() => handleAction('RELEASED')}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg py-2 text-sm transition-colors"
            >
              Release Order
            </button>
          </div>
        )}

        {isMyOrder && order.status === 'PICKED' && (
          <button
            onClick={() => handleAction('DELIVERED')}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Updating...' : 'Mark as Delivered'}
          </button>
        )}

        {isMyOrder && order.status === 'DELIVERED' && (
          <button
            onClick={() => handleAction('COMPLETED')}
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Completing...' : 'Complete Order'}
          </button>
        )}
      </div>
    </div>
  )
}
