'use client'

import { useState } from 'react'
import FormField from '@/components/FormField'
import OrderConfirmation from '@/components/OrderConfirmation'

interface FormData {
  customerName: string
  customerPhone: string
  foodItem: string
  vendorName: string
  pickupTime: string
  deliveryLocation: string
  notes: string
}

interface FormErrors {
  customerName?: string[]
  customerPhone?: string[]
  foodItem?: string[]
  vendorName?: string[]
  pickupTime?: string[]
  deliveryLocation?: string[]
  notes?: string[]
}

const emptyForm: FormData = {
  customerName: '',
  customerPhone: '',
  foodItem: '',
  vendorName: '',
  pickupTime: '',
  deliveryLocation: '',
  notes: '',
}

export default function OrderPage() {
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [confirmed, setConfirmed] = useState<{
    orderNumber: number
    customerName: string
  } | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setServerError('')
    setErrors({})

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          notes: form.notes || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setServerError(data.message || 'Something went wrong.')
        }
        return
      }

      setConfirmed({
        orderNumber: data.orderNumber,
        customerName: form.customerName,
      })
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleNewOrder() {
    setForm(emptyForm)
    setErrors({})
    setServerError('')
    setConfirmed(null)
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-brand-orange/5 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
          <OrderConfirmation
            orderNumber={confirmed.orderNumber}
            customerName={confirmed.customerName}
            onNewOrder={handleNewOrder}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-orange/5 px-4 py-8">
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-md p-6">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-orange">Grub N Snack</h1>
          <p className="text-sm text-brand-blue mt-1">Place your food order</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <FormField label="Your Name" error={errors.customerName?.[0]} required>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="e.g. John Kamau"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </FormField>

          <FormField label="Your Phone Number" error={errors.customerPhone?.[0]} required>
            <input
              type="tel"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </FormField>

          <FormField label="Food Item" error={errors.foodItem?.[0]} required>
            <input
              type="text"
              name="foodItem"
              value={form.foodItem}
              onChange={handleChange}
              placeholder="e.g. Chicken burger and fries"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </FormField>

          <FormField label="Vendor / Restaurant Name" error={errors.vendorName?.[0]} required>
            <input
              type="text"
              name="vendorName"
              value={form.vendorName}
              onChange={handleChange}
              placeholder="e.g. KFC Westlands"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </FormField>

          <FormField label="Pickup Time" error={errors.pickupTime?.[0]} required>
            <input
              type="text"
              name="pickupTime"
              value={form.pickupTime}
              onChange={handleChange}
              placeholder="e.g. 1:00 PM or ASAP"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </FormField>

          <FormField label="Delivery Location" error={errors.deliveryLocation?.[0]} required>
            <input
              type="text"
              name="deliveryLocation"
              value={form.deliveryLocation}
              onChange={handleChange}
              placeholder="e.g. Kilimani, near Junction Mall gate 2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </FormField>

          <FormField label="Additional Notes" error={errors.notes?.[0]}>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g. Extra sauce, call when nearby, gate code 1234"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
            />
          </FormField>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 disabled:bg-brand-orange/50 text-white font-semibold rounded-lg py-3 text-sm transition-colors mt-2"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>

        </form>

      </div>
    </main>
  )
}
