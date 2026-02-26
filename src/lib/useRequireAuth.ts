'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRequireAuth(requiredRole?: 'ADMIN' | 'DRIVER') {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/driver/dashboard')
      }
    }
  }, [session, status, router, requiredRole])

  return { session, status }
}
