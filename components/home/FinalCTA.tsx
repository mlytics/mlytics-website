'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

export function FinalCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="w-fit mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What does Mlytics Cortex mean for your business?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          Real analysis from your actual data — not a template.
        </p>
        <Link
          href="/book-a-demo"
          onClick={() => trackCTA('Get a Personalized Demo', 'home_cta')}
          className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-white text-primary"
        >
          Get a Personalized Demo
        </Link>
      </div>
    </section>
  )
}
