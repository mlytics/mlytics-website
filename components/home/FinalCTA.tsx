'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

export function FinalCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What does Mlytics Cortex mean for your business?
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          Paste your website. We'll use your actual data to run a real analysis — not a generic demo.
        </p>
        <Link
          href="/book-a-demo"
          onClick={() => trackCTA('Book a Demo', 'home_cta')}
          className="inline-block px-8 py-3.5 rounded-full text-sm font-semibold text-[#225D59] bg-white hover:bg-gray-100 transition-all active:scale-[0.98]"
        >
          See what the Mlytics Cortex finds
        </Link>
      </div>
    </section>
  )
}
