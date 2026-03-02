'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'
import MathCaptcha from '@/components/MathCaptcha'

interface FormData {
  name: string
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string[]
  username?: string[]
  email?: string[]
  phone?: string[]
  password?: string[]
  confirmPassword?: string[]
  captcha?: string[]
}

const emptyForm: FormData = {
  name: '',
  username: '',
  email: '',
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
  const [captchaValid, setCaptchaValid] = useState(false)
  const [captchaError, setCaptchaError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError('')
  }

  const handleCaptchaChange = useCallback((isValid: boolean) => {
    setCaptchaValid(isValid)
    if (isValid) setCaptchaError('')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!captchaValid) {
      setCaptchaError('Please solve the math question correctly before submitting.')
      return
    }

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
      setServerError(
        'Network error. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────
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
              <CheckCircle className="w-10 h-10" style={{ color: '#e3720d' }} />
            </div>
          </div>

          <div>
            <h2
              className="text-2xl font-extrabold"
              style={{ color: '#242a41', fontFamily: 'Montserrat, sans-serif' }}
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
            {[
              'Our admin team will review your application.',
              'Once approved your account will be activated.',
              'You can then log in and start accepting orders.',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: '#e3720d' }}
                >
                  {i + 1}
                </span>
                <p className="text-gray-600">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Approval usually takes less than 24 hours. Come back and
            try logging in after you hear from us.
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

  // ── Signup form ─────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#242a41' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-7">
          <h1
            className="text-2xl font-extrabold"
            style={{ color: '#e3720d', fontFamily: 'Montserrat, sans-serif' }}
          >
            Grub N Snack
          </h1>
          <p className="text-sm font-semibold mt-1" style={{ color: '#242a41' }}>
            Driver Application
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Fill in your details to join our delivery team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
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

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1"
              style={{ color: '#242a41' }}>
              Username <span style={{ color: '#e3720d' }}>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. james_driver"
              autoComplete="username"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            {errors.username?.[0] && (
              <p className="text-xs text-red-500 mt-1">{errors.username[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1"
              style={{ color: '#242a41' }}>
              Email Address <span style={{ color: '#e3720d' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. james@email.com"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            {errors.email?.[0] && (
              <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
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
              autoComplete="tel"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
            {errors.phone?.[0] && (
              <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>
            )}
          </div>

          {/* Password */}
          <PasswordInput
            name="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            error={errors.password?.[0]}
            required
          />

          {/* Confirm Password */}
          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            error={errors.confirmPassword?.[0]}
            required
          />

          {/* Math CAPTCHA */}
          <div className="pt-1">
            <MathCaptcha
              onValidChange={handleCaptchaChange}
              error={captchaError}
            />
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
            disabled={loading || !captchaValid}
            className="w-full py-3 rounded-full text-white font-bold text-sm transition-all mt-2"
            style={{
              backgroundColor:
                loading || !captchaValid
                  ? 'rgba(227,114,13,0.4)'
                  : '#e3720d',
              cursor: loading || !captchaValid ? 'not-allowed' : 'pointer',
              transform:
                !loading && captchaValid ? 'translateY(0)' : undefined,
            }}
          >
            {loading
              ? 'Submitting Application...'
              : !captchaValid
              ? 'Solve the math question to continue'
              : 'Apply to be a Driver'}
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
