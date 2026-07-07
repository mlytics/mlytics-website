'use client'

import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'

export function FinalCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-xl mx-auto px-6">
        <h2 className="section-heading text-white mb-3">
          What does Mlytics Cortex mean for your business?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          Real analysis from your actual data — not a template.
        </p>
        <InlineEmailCTA ctaLabel="home_cta" pageName="Home Final CTA" className="mx-auto" />
      </div>
    </section>
  )
}
