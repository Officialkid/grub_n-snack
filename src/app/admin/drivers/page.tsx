'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { format } from 'date-fns'
import { UserPlus, X, CheckCircle, XCircle } from 'lucide-react'

interface Driver {
  id: string
  name: string
  phone: string
  isActive: boolean
  isOnDuty: boolean
  createdAt: string
  _count: { orders: number }
}

interface CreateDriverForm {
  name: string
  phone: string
  password: string
}

const emptyForm: CreateDriverForm = { name: '', phone: '', password: '' }

export default function AdminDriversPage() {
  const { status } = useRequireAuth('ADMIN')
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateDriverForm>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function fetchDrivers() {
    setLoading(true)
    try {
      const res = await fetch('/api/drivers')
      const data = await res.json()
      if (data.success) setDrivers(data.drivers)
    } catch {
      console.error('Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') fetchDrivers()
  }, [status])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: [] }))
  }

  async function handleCreateDriver(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    setFormErrors({})

    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.errors) setFormErrors(data.errors)
        else setFormError(data.message || 'Failed to create driver')
        return
      }

      setShowModal(false)
      setForm(emptyForm)
      await fetchDrivers()
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(driver: Driver) {
    setTogglingId(driver.id)
    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !driver.isActive }),
      })
      if (res.ok) await fetchDrivers()
    } catch {
      alert('Failed to update driver')
    } finally {
      setTogglingId(null)
    }
  }

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
          <h1 className="text-xl font-bold text-brand-blue">Drivers</h1>
          <p className="text-sm text-gray-500">{drivers.length} registered drivers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Drivers table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deliveries</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No drivers yet. Add your first driver.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{driver.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{driver.phone}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">{driver._count.orders}</span>
                      <span className="text-gray-400 text-xs ml-1">completed</span>
                    </td>
                    <td className="px-4 py-3">
                      {driver.isOnDuty ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          On Duty
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <span className="w-2 h-2 bg-gray-300 rounded-full" />
                          Off Duty
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {driver.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {format(new Date(driver.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(driver)}
                        disabled={togglingId === driver.id}
                        className={`text-xs font-medium transition-colors ${
                          driver.isActive
                            ? 'text-red-400 hover:text-red-600'
                            : 'text-green-500 hover:text-green-700'
                        }`}
                      >
                        {togglingId === driver.id
                          ? '...'
                          : driver.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Add New Driver</h2>
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm); setFormErrors({}) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. James Mwangi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
                {formErrors.name?.[0] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0722000000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
                {formErrors.phone?.[0] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.phone[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
                {formErrors.password?.[0] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.password[0]}</p>
                )}
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {formError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(emptyForm); setFormErrors({}) }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/90 disabled:bg-brand-orange/50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
