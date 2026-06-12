'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

export function PublisherPageCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="w-fit mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Want to see your site's real intent data?
        </h2>
        <p className="text-base mb-8" style={{ color: '#A8C5C3' }}>
          See what your readers' intent is already worth.
        </p>
        <Link
          href="/book-a-demo"
          onClick={() => trackCTA('Get a Personalized Demo', 'content_owners_cta')}
          className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'white', color: '#225D59' }}
        >
          Get a Personalized Demo
        </Link>
      </div>
    </section>
  )
}
