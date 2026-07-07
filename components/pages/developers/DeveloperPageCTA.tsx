'use client'

import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'

export function DeveloperPageCTA() {
  return (
    <section className="section-dark py-16 text-center bg-primary-dark">
      <div className="max-w-xl mx-auto px-6">
        <h2 className="section-heading text-white mb-3">
          What can Cortex optimize in your stack?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          Built around your stack — no generic pitch.
        </p>
        <InlineEmailCTA ctaLabel="developers_cta" pageName="Developers Page CTA" className="mx-auto" />
      </div>
    </section>
  )
}
