'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      identifier,
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
        pending_approval:
          'Your account is pending admin approval. You will be notified once approved.',
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
              Phone or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Phone number or email address"
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

        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-400">Grub N Snack Internal System</p>
          <p className="text-xs text-gray-400">
            New driver?{' '}
            <Link
              href="/signup"
              className="font-semibold hover:underline"
              style={{ color: '#e3720d' }}
            >
              Apply to join the team
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
