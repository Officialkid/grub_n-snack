'use client'

import { useState } from 'react'

interface DutyToggleProps {
  initialIsOnDuty: boolean
  onToggle: (isOnDuty: boolean) => void
}

export default function DutyToggle({ initialIsOnDuty, onToggle }: DutyToggleProps) {
  const [isOnDuty, setIsOnDuty] = useState(initialIsOnDuty)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const newStatus = !isOnDuty

    try {
      const res = await fetch('/api/drivers/duty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnDuty: newStatus }),
      })

      if (res.ok) {
        setIsOnDuty(newStatus)
        onToggle(newStatus)
      }
    } catch {
      console.error('Failed to update duty status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        isOnDuty
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-gray-100 text-gray-500 border border-gray-300'
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isOnDuty ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {loading ? 'Updating...' : isOnDuty ? 'On Duty' : 'Off Duty'}
    </button>
  )
}
