'use client'

import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'

export function PublisherPageCTA() {
  return (
    <section className="section-dark py-16 text-center">
      <div className="max-w-xl mx-auto px-6">
        <h2 className="section-heading text-white mb-3">
          Want to see your site's real intent data?
        </h2>
        <p className="text-base mb-8 text-on-dark">
          See what your readers' intent is already worth.
        </p>
        <InlineEmailCTA ctaLabel="content_owners_cta" pageName="Content Owners Page CTA" className="mx-auto" />
      </div>
    </section>
  )
}
