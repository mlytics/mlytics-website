import { ZeroClickSection } from '@/components/pages/publishers/ZeroClickSection'
import { SolutionPitches } from '@/components/pages/publishers/SolutionPitches'
import { KnowledgeBaseSection } from '@/components/pages/publishers/KnowledgeBaseSection'
import { LayerOverview } from '@/components/pages/publishers/LayerOverview'
import { ContentOwnerVerticals } from '@/components/pages/publishers/ContentOwnerVerticals'
import { PublisherPageCTA } from '@/components/pages/publishers/PublisherPageCTA'

export const metadata = { title: 'For Content Owners — Mlytics Cortex' }

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
            For Content Owners &amp; Media Platforms
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Every layer earns.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            Not just cost savings — three independent revenue and savings layers, all from one integration.
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

      <PublisherPageCTA />
    </>
  )
}
