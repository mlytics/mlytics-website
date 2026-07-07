'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function Footer() {
  const pathname = usePathname()
  const p = pathname.replace(/\/$/, '') || '/'
  const isActive = (href: string) => p === href
  return (
    <footer className="section-dark border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <span className="text-lg font-bold text-white">Mlytics</span>
            <p className="text-sm mt-1 text-on-dark">Mlytics Cortex, a Discovery and Answer Engine for Business</p>
            <div className="flex gap-3 mt-3">
              <a href="https://www.linkedin.com/company/mlytics/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center p-1.5 -ml-1.5 rounded-lg transition-colors hover:bg-white/10 text-on-dark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm text-on-dark">
            <div className="flex flex-col gap-2">
              <Eyebrow color="rgba(168,197,195,0.7)">Solutions</Eyebrow>
              <Link href="/content-owners" className="hover:text-white transition-colors" style={isActive('/content-owners') ? { color: '#fff', fontWeight: 600 } : {}}>Media and Content</Link>
              <Link href="/brands" className="hover:text-white transition-colors" style={isActive('/brands') ? { color: '#fff', fontWeight: 600 } : {}}>Brands</Link>
              <Link href="/developers" className="hover:text-white transition-colors" style={isActive('/developers') ? { color: '#fff', fontWeight: 600 } : {}}>Developers</Link>
              <Link href="/partnership" className="hover:text-white transition-colors" style={isActive('/partnership') ? { color: '#fff', fontWeight: 600 } : {}}>Partnership</Link>
              <Link href="/book-a-demo" className="hover:text-white transition-colors" style={isActive('/book-a-demo') ? { color: '#fff', fontWeight: 600 } : {}}>Contact</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Eyebrow color="rgba(168,197,195,0.7)">Resources</Eyebrow>
              <a href="https://www.mlytics.com/blog/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a>
              <a href="https://help.mlytics.com/en/knowledge" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Help Center</a>
              <a href="https://learning.mlytics.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Learning Center</a>
              <a href="https://www.104.com.tw/company/1a2x6bk3ve" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Careers</a>
            </div>
            <div className="flex flex-col gap-2">
              <Eyebrow color="rgba(168,197,195,0.7)">Legal</Eyebrow>
              <Link href="/terms-of-service" className="hover:text-white transition-colors" style={isActive('/terms-of-service') ? { color: '#fff', fontWeight: 600 } : {}}>Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors" style={isActive('/privacy-policy') ? { color: '#fff', fontWeight: 600 } : {}}>Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/8 text-xs text-center" style={{ color: 'rgba(168,197,195,0.7)' }}>
          © 2026 Mlytics. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
