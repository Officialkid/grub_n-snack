'use client'

import { signOut } from 'next-auth/react'

interface SignOutButtonProps {
  className?: string
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={className ?? 'text-sm text-gray-500 hover:text-red-500 transition-colors'}
    >
      Sign Out
    </button>
  )
}
