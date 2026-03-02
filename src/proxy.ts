import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === 'ADMIN'

  // Public routes — always accessible, no auth needed
  const publicRoutes = ['/home', '/login', '/order', '/signup']
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Not logged in — send to landing page
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // Driver trying to access admin routes
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/driver/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
