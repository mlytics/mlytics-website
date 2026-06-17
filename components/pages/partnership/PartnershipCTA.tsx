'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

export function PartnershipCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Ready to activate?
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          Tell us about your digital asset platform and audience.
        </p>
        <Link
          href="/book-a-demo"
          onClick={() => trackCTA('Get in Touch', 'partnership_cta')}
          className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'white', color: '#225D59' }}
        >
          Get in Touch
        </Link>
      </div>
    </section>
  )
}
