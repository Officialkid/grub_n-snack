'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  label: string
  required?: boolean
}

export default function PasswordInput({
  name,
  value,
  onChange,
  placeholder = 'Enter password',
  error,
  label,
  required = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: '#242a41' }}
      >
        {label}
        {required && (
          <span style={{ color: '#e3720d' }} className="ml-1">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors pr-11"
          onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
