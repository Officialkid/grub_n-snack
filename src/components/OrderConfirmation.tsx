import { CheckCircle } from 'lucide-react'

interface OrderConfirmationProps {
  orderNumber: number
  customerName: string
  onNewOrder: () => void
}

export default function OrderConfirmation({
  orderNumber,
  customerName,
  onNewOrder,
}: OrderConfirmationProps) {
  return (
    <div className="text-center space-y-4 py-6">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">Order Placed!</h2>
        <p className="text-gray-500 text-sm mt-1">
          Hi {customerName}, your order has been received.
        </p>
      </div>
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl px-6 py-4">
        <p className="text-sm text-gray-500">Your Order Number</p>
        <p className="text-4xl font-bold text-brand-orange">#{orderNumber}</p>
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        <p>A driver will be assigned shortly.</p>
        <p>You will receive a WhatsApp confirmation.</p>
        <p className="font-medium text-gray-700">Save your order number for reference.</p>
      </div>
      <button
        onClick={onNewOrder}
        className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
      >
        Place Another Order
      </button>
    </div>
  )
}
