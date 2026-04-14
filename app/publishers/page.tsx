import { PublisherAgentContinuation } from '@/components/pages/publishers/AgentContinuation'
import { ZeroClickSection } from '@/components/pages/publishers/ZeroClickSection'
import { SolutionPitches } from '@/components/pages/publishers/SolutionPitches'
import { KnowledgeBaseSection } from '@/components/pages/publishers/KnowledgeBaseSection'
import { ContentOwnerVerticals } from '@/components/pages/publishers/ContentOwnerVerticals'
import { PublisherPageCTA } from '@/components/pages/publishers/PublisherPageCTA'

export const metadata = { title: 'For Content Owners — Mlytics Decision Engine' }

export default function PublishersPage() {
  return (
    <>
      {/* Hero + Agent continuation — first thing visitors see */}
      <PublisherAgentContinuation />

      {/* Zero-click economy problem */}
      <ZeroClickSection />

      {/* Solution — three pitches vs LLM search */}
      <SolutionPitches />

      {/* Knowledge base engineering */}
      <KnowledgeBaseSection />

      {/* Layer overview */}
      <section className="section-dark py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">Three layers. One integration.</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                layer: 'Layer 1',
                name: 'Decisive Engine',
                price: '$1,000/mo',
                desc: 'Content delivery <50ms. 20% TCO reduction. One API replaces your CDN contracts.',
              },
              {
                layer: 'Layer 2',
                name: 'AI Q&A Widget',
                price: '$5,000/mo',
                desc: '$0.10/article vs $250 human cost. Every article becomes an intent capture point.',
              },
              {
                layer: 'Layer 3',
                name: 'Full Conversation CPL',
                price: 'Revenue share',
                desc: 'Strong-intent readers matched to brands. CPL revenue from content you already own.',
              },
            ].map(item => (
              <div key={item.layer} className="rounded-2xl p-5" style={{ background: 'rgba(34,93,89,0.25)', border: '1px solid rgba(34,93,89,0.45)' }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(168,197,195,0.12)', color: '#A8C5C3', border: '1px solid rgba(168,197,195,0.3)' }}>
                    {item.layer}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-1 text-white">{item.name}</h3>
                <p className="text-xs font-semibold mb-2" style={{ color: '#F59E0B' }}>{item.price}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#A8C5C3' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof — verticals + client names */}
      <ContentOwnerVerticals />

      <PublisherPageCTA />
    </>
  )
}
