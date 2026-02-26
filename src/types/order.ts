export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PICKED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RELEASED'

export interface Order {
  id: string
  orderNumber: number
  customerName: string
  customerPhone: string
  foodItem: string
  vendorName: string
  pickupTime: string
  deliveryLocation: string
  notes?: string | null
  status: OrderStatus
  driverId?: string | null
  driver?: {
    id: string
    name: string
    phone: string
  } | null
  createdAt: string
  acceptedAt?: string | null
  pickedAt?: string | null
  deliveredAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
  reminderSentAt?: string | null
}

export interface CreateOrderInput {
  customerName: string
  customerPhone: string
  foodItem: string
  vendorName: string
  pickupTime: string
  deliveryLocation: string
  notes?: string
}

export interface UpdateOrderStatusInput {
  orderId: string
  status: OrderStatus
  driverId?: string
  note?: string
}
