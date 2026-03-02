'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface FormData {
  name: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string[]
  phone?: string[]
  password?: string[]
  confirmPassword?: string[]
}

const emptyForm: FormData = {
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

export default function SignupPage() {
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [driverName, setDriverName] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setServerError('')
    setErrors({})

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

      setDriverName(form.name)
      setSubmitted(true)
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (submitted) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#242a41' }}
      >
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(227,114,13,0.1)' }}
            >
              <CheckCircle
                className="w-10 h-10"
                style={{ color: '#e3720d' }}
              />
            </div>
          </div>

          <div>
            <h2
              className="text-2xl font-extrabold"
              style={{
                color: '#242a41',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Application Submitted!
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Hi {driverName}, your driver application has been received.
            </p>
          </div>

          <div
            className="rounded-xl p-5 text-left space-y-3 text-sm"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <p className="font-semibold" style={{ color: '#242a41' }}>
              What happens next?
            </p>
            <div className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: '#e3720d' }}
              >
                1
              </span>
              <p className="text-gray-600">
                Our admin team will review your application.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: '#e3720d' }}
              >
                2
              </span>
              <p className="text-gray-600">
                Once approved your account will be activated.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: '#e3720d' }}
              >
                3
              </span>
              <p className="text-gray-600">
                You can then log in and start accepting orders.
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Approval usually takes less than 24 hours. Come back and try
            logging in after you hear from us.
          </p>

          <Link
            href="/login"
            className="block w-full py-3 rounded-full text-white font-bold text-sm text-center transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: '#242a41' }}
          >
            Back to Login
          </Link>
        </div>
      </main>
    )
  }

  // Signup form
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#242a41' }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-7">
          <h1
            className="text-2xl font-extrabold"
            style={{
              color: '#e3720d',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Grub N Snack
          </h1>
          <p
            className="text-sm font-semibold mt-1"
            style={{ color: '#242a41' }}
          >
            Driver Application
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sign up to join our delivery team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1"
              style={{ color: '#242a41' }}>
              Full Name <span style={{ color: '#e3720d' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. James Mwangi"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            {errors.name?.[0] && (
              <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1"
              style={{ color: '#242a41' }}>
              Phone Number <span style={{ color: '#e3720d' }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            {errors.phone?.[0] && (
              <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1"
              style={{ color: '#242a41' }}>
              Password <span style={{ color: '#e3720d' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            {errors.password?.[0] && (
              <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1"
              style={{ color: '#242a41' }}>
              Confirm Password <span style={{ color: '#e3720d' }}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            {errors.confirmPassword?.[0] && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:-translate-y-0.5 mt-2"
            style={{
              backgroundColor: loading ? 'rgba(227,114,13,0.5)' : '#e3720d',
            }}
          >
            {loading ? 'Submitting Application...' : 'Apply to be a Driver'}
          </button>

        </form>

        {/* Login link */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: '#e3720d' }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  )
}
