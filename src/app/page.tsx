import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function RootPage() {
  const session = await auth()

  if (!session) {
    redirect('/home')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  if (session.user.role === 'DRIVER') {
    redirect('/driver/dashboard')
  }

  redirect('/home')
}
