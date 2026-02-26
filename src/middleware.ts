import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === 'ADMIN'
  const isDriver = session?.user?.role === 'DRIVER'

  // Public routes — always accessible
  const publicRoutes = ['/login', '/order']
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Not logged in — redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Driver trying to access admin routes
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/driver/dashboard', req.url))
  }

  // Admin trying to access driver routes
  if (pathname.startsWith('/driver') && !isDriver && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
