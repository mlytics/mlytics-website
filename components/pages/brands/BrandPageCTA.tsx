'use client'

import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'

export function BrandPageCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-heading text-white mb-3">
          How does Media AEO work for your brand?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          See where your brand fits inside the AI answers buyers already trust.
        </p>
        <InlineEmailCTA ctaLabel="brands_cta" pageName="Brands Page CTA" className="mx-auto" />
      </div>
    </section>
  )
}
