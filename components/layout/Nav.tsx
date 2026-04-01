'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useContactModal } from '@/context/contact-modal-context'

const NAV_LINKS = [
  { label: 'Publishers', href: '/publishers' },
  { label: 'Brands', href: '/brands' },
  { label: 'Developers', href: '/developers' },
]

export function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { open: openContact } = useContactModal()

  const isHome = pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
    : 'bg-transparent'

  const logoColor = !scrolled && isHome ? 'text-white' : 'text-[#225D59]'
  const linkColor = !scrolled && isHome ? 'text-white/70 hover:text-white' : 'text-[#6B6B6B] hover:text-[#225D59]'
  const activeLinkColor = !scrolled && isHome ? 'text-white' : 'text-[#225D59]'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="mlytics"
            width={96}
            height={17}
            priority
            className="transition-all duration-300"
            style={!scrolled && isHome ? { filter: 'brightness(0) invert(1)' } : undefined}
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors relative ${
                pathname === link.href ? activeLinkColor : linkColor
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-[#225D59]"
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={openContact}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#225D59' }}
          >
            Book a Demo
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className={`md:hidden transition-colors ${logoColor}`}
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
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium py-1 ${
                    pathname === link.href ? 'text-[#225D59]' : 'text-[#6B6B6B]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setMobileOpen(false); openContact() }}
                className="w-full mt-2 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: '#225D59' }}
              >
                Book a Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
