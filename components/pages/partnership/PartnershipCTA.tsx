'use client'

import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'

export function PartnershipCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-heading text-white mb-3">
          Ready to activate?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          Tell us about your digital asset platform and audience.
        </p>
        <InlineEmailCTA ctaLabel="partnership_cta" pageName="Partnership Page CTA" className="mx-auto" />
      </div>
    </section>
  )
}
