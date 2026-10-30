import { ZeroClickSection } from '@/components/pages/publishers/ZeroClickSection'
import { SolutionPitches } from '@/components/pages/publishers/SolutionPitches'
import { KnowledgeBaseSection } from '@/components/pages/publishers/KnowledgeBaseSection'
import { LayerOverview } from '@/components/pages/publishers/LayerOverview'
import { ContentOwnerVerticals } from '@/components/pages/publishers/ContentOwnerVerticals'
import { ContentOwnerFAQ } from '@/components/pages/publishers/ContentOwnerFAQ'
import { PublisherPageCTA } from '@/components/pages/publishers/PublisherPageCTA'
import { PlaygroundCTASection } from '@/components/ui/PlaygroundCTASection'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Turn Your Audience Into Three New AI Revenue Layers',
  description: 'Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.',
  openGraph: {
    title: 'Turn Your Audience Into Three New AI Revenue Layers | Mlytics Cortex',
    description: 'Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.',
    url: 'https://www.mlytics.com/content-owners/',
  },
  twitter: {
    title: 'Turn Your Audience Into Three New AI Revenue Layers | Mlytics Cortex',
    description: 'Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.',
  },
  alternates: { canonical: '/content-owners/' },
}

export default function PublishersPage() {
  return (
    <>
      {/* Hero */}
      <div className="section-dark pt-32 pb-12 text-center border-b border-on-dark/12">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="label-eyebrow-pill mb-4 bg-primary/40 text-on-dark"
          >
            For Media and Content
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 text-balance">
            Turn your audience into three new revenue layers.
          </h1>
          <p className="text-base max-w-xl mx-auto text-on-dark">
            Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.
          </p>
        </div>
      </div>

      {/* Zero-click economy problem */}
      <ZeroClickSection />

      {/* Solution — three pitches vs LLM search */}
      <SolutionPitches />

      {/* Playground entry point — content-owners lens */}
      <PlaygroundCTASection
        eyebrow="Try the experience"
        heading="What does this look like inside your article?"
        body="Walk through one article with the AI Mode widget, and watch user signals land on the Media value ledger as they happen."
        ctaLabel="Try AI Mode"
        lens="content-owners"
        trackingPosition="content_owners_playground"
      />

      {/* Knowledge base engineering */}
      <KnowledgeBaseSection />

      {/* Layer overview */}
      <LayerOverview />

      {/* Proof — verticals + client names */}
      <ContentOwnerVerticals />
      <div className="section-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-px bg-line" />
        </div>
      </div>
      <ContentOwnerFAQ />

      <PublisherPageCTA />
    </>
  )
}
