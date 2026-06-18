'use client'

import Link from 'next/link'
import { trackCTA } from '@/lib/analytics'

export function PublisherPageCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="w-fit mx-auto px-6">
        <h2 className="section-heading text-white mb-3">
          Want to see your site's real intent data?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          See what your readers' intent is already worth.
        </p>
        <Link
          href="/book-a-demo"
          onClick={() => trackCTA('Get a Personalized Demo', 'content_owners_cta')}
          className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-white text-primary"
        >
          Get a Personalized Demo
        </Link>
      </div>
    </section>
  )
}
