import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/SessionWrapper'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: 'Grub N Snack',
  description: 'Order Management System',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Grub N Snack',
  },
}

export const viewport = {
  themeColor: '#e3720d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}
