import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  if (session.user.role === 'DRIVER') {
    redirect('/driver/dashboard')
  }

  redirect('/login')
}
