'use client'

import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'

export function DeveloperPageCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-heading text-white mb-3">
          What can Cortex optimize in your stack?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          Built around your stack — no generic pitch.
        </p>
        <InlineEmailCTA ctaLabel="developers_cta" pageName="Developers Page CTA" tone="dark" className="mx-auto" />
      </div>
    </section>
  )
}
