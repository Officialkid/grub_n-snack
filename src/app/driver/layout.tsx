import PWAInstallBanner from '@/components/PWAInstallBanner'

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PWAInstallBanner />
      {children}
    </>
  )
}
