'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

export function DeveloperPageCTA() {
  return (
    <section className="section-dark py-16 text-center" style={{ background: '#1A3D3A' }}>
      <div className="w-fit mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          See what Cortex can optimize for your site
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          Built around your stack — no generic pitch.
        </p>
        <Link
          href="/book-a-demo"
          onClick={() => trackCTA('Get a Personalized Demo', 'developers_cta')}
          className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'white', color: '#225D59' }}
        >
          Get a Personalized Demo
        </Link>
      </div>
    </section>
  )
}
