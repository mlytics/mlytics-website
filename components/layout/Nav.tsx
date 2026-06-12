'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { trackCTA } from '@/lib/analytics'

const NAV_LINKS = [
  { label: 'Media and Content', href: '/content-owners' },
  { label: 'Brands', href: '/brands' },
  { label: 'Developers', href: '/developers' },
]

export function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastScrollY = useRef(0)

  const normalizedPathname = pathname.replace(/\/$/, '') || '/'

  useEffect(() => {
    const handler = () => {
      const currentY = window.scrollY
      const diff = currentY - lastScrollY.current

      setScrolled(currentY > 20)

      // Only apply hide/show on desktop (window width >= 1024)
      if (window.innerWidth >= 1024) {
        if (currentY < 60) {
          setVisible(true)
        } else if (diff > 6) {
          setVisible(false)
        } else if (diff < -4) {
          setVisible(true)
        }
      }

      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navBg = scrolled
    ? 'bg-white/80 backdrop-blur-sm border-b border-gray-100/50 shadow-sm'
    : 'bg-white/80 backdrop-blur-sm border-b border-gray-100/50'

  const logoColor = 'text-[#225D59]'
  const linkColor = 'text-[#6B6B6B] hover:text-[#225D59]'
  const activeLinkColor = 'text-[#225D59]'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo.svg"
            alt="Mlytics"
            width={96}
            height={17}
            className="transition-all duration-300"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                normalizedPathname === link.href ? `${activeLinkColor} font-semibold` : `${linkColor} font-medium`
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/book-a-demo"
            onClick={() => trackCTA('Book a Demo', 'nav')}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#225D59' }}
          >
            Book a Demo
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className={`lg:hidden transition-colors ${logoColor}`}
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm py-1 ${
                    normalizedPathname === link.href ? 'text-[#225D59] font-semibold' : 'text-[#6B6B6B] font-medium'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/book-a-demo"
                onClick={() => { trackCTA('Book a Demo', 'nav_mobile'); setMobileOpen(false) }}
                className="block w-full mt-2 py-2.5 rounded-full text-sm font-semibold text-white text-center"
                style={{ background: '#225D59' }}
              >
                Book a Demo
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
