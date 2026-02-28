'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#locations', label: 'Locations' },
  { href: '#contact', label: 'Contact' },
]

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)

      const sections = document.querySelectorAll('section[id]')
      let current = 'home'
      sections.forEach((section) => {
        const el = section as HTMLElement
        if (window.scrollY >= el.offsetTop - 100) {
          current = section.id
        }
      })
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (href.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        window.scrollTo({
          top: (target as HTMLElement).offsetTop - 70,
          behavior: 'smooth',
        })
      }
      setMenuOpen(false)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
      style={{ backgroundColor: '#242a41' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <span
            className="text-2xl font-bold"
            style={{ color: '#e3720d', fontFamily: 'Montserrat, sans-serif' }}
          >
            Grub
          </span>
          <span
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            N Snack
          </span>
        </Link>

        {/* Desktop Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const sectionId = href.replace('#', '')
            const isActive = activeSection === sectionId
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                style={{
                  color: isActive ? '#e3720d' : 'rgba(255,255,255,0.8)',
                }}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 rounded-full"
                    style={{ backgroundColor: '#e3720d' }}
                  />
                )}
              </a>
            )
          })}
        </nav>

        {/* Desktop Right CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/order"
            className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: '#e3720d' }}
          >
            Order Now
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border-2 hover:-translate-y-0.5"
            style={{
              borderColor: 'rgba(255,255,255,0.4)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            System Admin
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-2"
          style={{
            backgroundColor: '#1a1f33',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          {navLinks.map(({ href, label }) => {
            const sectionId = href.replace('#', '')
            const isActive = activeSection === sectionId
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: isActive ? '#e3720d' : 'rgba(255,255,255,0.8)',
                  backgroundColor: isActive
                    ? 'rgba(227,114,13,0.1)'
                    : 'transparent',
                }}
              >
                {label}
              </a>
            )
          })}
          <div className="pt-3 space-y-2 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <Link
              href="/order"
              className="block text-center py-2.5 px-4 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: '#e3720d' }}
              onClick={() => setMenuOpen(false)}
            >
              Order Now
            </Link>
            <Link
              href="/login"
              className="block text-center py-2.5 px-4 rounded-full text-sm font-bold border-2 transition-colors"
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.9)',
              }}
              onClick={() => setMenuOpen(false)}
            >
              System Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
