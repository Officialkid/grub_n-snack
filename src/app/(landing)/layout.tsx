import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Grub N Snack - Savour Every Bite',
  description:
    'Food delivery for students. Affordable, fast, and reliable delivery across campus.',
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
