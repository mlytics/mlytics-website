'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

export function DeveloperPageCTA() {
  return (
    <section className="section-dark py-16 text-center" style={{ background: '#1A3D3A' }}>
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Want to check compatibility with your current architecture?
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          We'll schedule a technical evaluation — architecture review, compatibility check, and a realistic savings estimate.
        </p>
        <Link
          href="/book-a-demo"
          onClick={() => trackCTA('Book a Demo', 'developers_cta')}
          className="inline-block px-8 py-3.5 rounded-full text-sm font-semibold text-[#225D59] bg-white hover:bg-gray-100 transition-all active:scale-[0.98]"
        >
          Get a Personalized Demo
        </Link>
      </div>
    </section>
  )
}
