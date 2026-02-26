'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    })

    if (result?.error) {
      const code = result.url
        ? new URL(result.url).searchParams.get('code')
        : null
      const errorMessages: Record<string, string> = {
        invalid_credentials: 'Invalid phone number or password.',
        account_deactivated: 'Your account has been deactivated. Contact admin.',
      }
      setError(errorMessages[code ?? ''] ?? 'Invalid phone number or password.')
      setLoading(false)
      return
    }

    // Fetch session to determine role and redirect
    const res = await fetch('/api/auth/session')
    const session = await res.json()

    if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (session?.user?.role === 'DRIVER') {
      router.push('/driver/dashboard')
    } else {
      setError('Unknown role. Contact admin.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-brand-blue flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-orange">Grub N Snack</h1>
          <p className="text-sm text-brand-blue/60 mt-1">Driver & Admin Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 disabled:bg-brand-orange/50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <p className="text-center text-xs text-brand-blue/40 mt-6">
          Grub N Snack Internal System
        </p>
      </div>
    </main>
  )
}
