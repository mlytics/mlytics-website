'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  const p = pathname.replace(/\/$/, '') || '/'
  const isActive = (href: string) => p === href
  return (
    <footer className="section-dark border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <span className="text-lg font-bold text-white">Mlytics</span>
            <p className="text-sm mt-1" style={{ color: '#A8C5C3' }}>Mlytics Cortex, AI-Decision Engine - per dollar per intelligent outcome.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm" style={{ color: '#A8C5C3' }}>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6B8F8D' }}>Solutions</span>
              <Link href="/content-owners" className="hover:text-white transition-colors" style={isActive('/content-owners') ? { color: '#fff', fontWeight: 600 } : {}}>Content Owners</Link>
              <Link href="/brands" className="hover:text-white transition-colors" style={isActive('/brands') ? { color: '#fff', fontWeight: 600 } : {}}>Brands</Link>
              <Link href="/developers" className="hover:text-white transition-colors" style={isActive('/developers') ? { color: '#fff', fontWeight: 600 } : {}}>Developers</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6B8F8D' }}>Resources</span>
              <a href="https://www.mlytics.com/blog/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a>
              <a href="https://help.mlytics.com/en/knowledge" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Help Center</a>
              <a href="https://learning.mlytics.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Learning Center</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6B8F8D' }}>Legal</span>
              <Link href="/terms-of-service" className="hover:text-white transition-colors" style={isActive('/terms-of-service') ? { color: '#fff', fontWeight: 600 } : {}}>Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors" style={isActive('/privacy-policy') ? { color: '#fff', fontWeight: 600 } : {}}>Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-xs text-center" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6B8F8D' }}>
          © 2026 Mlytics. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
