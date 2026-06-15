import { ZeroClickSection } from '@/components/pages/publishers/ZeroClickSection'
import { SolutionPitches } from '@/components/pages/publishers/SolutionPitches'
import { KnowledgeBaseSection } from '@/components/pages/publishers/KnowledgeBaseSection'
import { LayerOverview } from '@/components/pages/publishers/LayerOverview'
import { ContentOwnerVerticals } from '@/components/pages/publishers/ContentOwnerVerticals'
import { ContentOwnerFAQ } from '@/components/pages/publishers/ContentOwnerFAQ'
import { PublisherPageCTA } from '@/components/pages/publishers/PublisherPageCTA'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Turn Your Audience Into Three New AI Revenue Layers | Mlytics Cortex',
  description: 'Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.',
  openGraph: {
    title: 'Turn Your Audience Into Three New AI Revenue Layers | Mlytics Cortex',
    description: 'Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.',
  },
  twitter: {
    title: 'Turn Your Audience Into Three New AI Revenue Layers | Mlytics Cortex',
    description: 'Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.',
  },
}

export default function PublishersPage() {
  return (
    <>
      {/* Hero */}
      <div className="section-dark pt-32 pb-12 text-center" style={{ borderBottom: '1px solid rgba(168,197,195,0.12)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: '#A8C5C3', border: '1px solid rgba(34,93,89,0.6)' }}
          >
            For Media and Content
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Turn your audience into<br />three new revenue layers.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            Mlytics Cortex connects your AI-engaged audience to brand partners across three independent revenue layers — without losing a single reader to AI search.
          </p>
        </div>
      </div>

      {/* Zero-click economy problem */}
      <ZeroClickSection />

      {/* Solution — three pitches vs LLM search */}
      <SolutionPitches />

      {/* Knowledge base engineering */}
      <KnowledgeBaseSection />

      {/* Layer overview */}
      <LayerOverview />

      {/* Proof — verticals + client names */}
      <ContentOwnerVerticals />

      <ContentOwnerFAQ />

      <PublisherPageCTA />
    </>
  )
}
