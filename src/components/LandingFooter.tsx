import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer style={{ backgroundColor: '#242a41' }} className="text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              <span
                className="text-2xl font-extrabold"
                style={{ color: '#e3720d', fontFamily: 'Montserrat, sans-serif' }}
              >
                Grub
              </span>
              <span
                className="text-2xl font-extrabold text-white"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                N Snack
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your ultimate food delivery companion, tailored for university
              students seeking convenience and affordability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white relative">
              Quick Links
              <span
                className="absolute -bottom-2 left-0 w-10 h-0.5 rounded-full"
                style={{ backgroundColor: '#e3720d' }}
              />
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {['#home:Home', '#about:About', '#features:Features', '#locations:Locations', '#contact:Contact'].map(
                (item) => {
                  const [href, label] = item.split(':')
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-white/60 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        {label}
                      </a>
                    </li>
                  )
                }
              )}
            </ul>
          </div>

          {/* Delivery Locations */}
          <div>
            <h4 className="font-bold mb-4 text-white relative">
              Delivery Locations
              <span
                className="absolute -bottom-2 left-0 w-10 h-0.5 rounded-full"
                style={{ backgroundColor: '#e3720d' }}
              />
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              {[
                'UON Main Campus',
                'Chiromo Campus',
                'Faculty of Engineering',
                'UON Environs',
                'Hotels & YMCA',
              ].map((loc) => (
                <li key={loc}>{loc}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <p>© 2025 Grub N Snack. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/order" style={{ color: '#e3720d' }} className="hover:underline">
              Place Order
            </Link>
            <Link href="/login" className="text-white/40 hover:text-white transition-colors">
              System Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
