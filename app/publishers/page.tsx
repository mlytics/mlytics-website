import { PublisherAgentContinuation } from '@/components/pages/publishers/AgentContinuation'
import { RevenueCalculator } from '@/components/pages/publishers/RevenueCalculator'
import { PublisherPageCTA } from '@/components/pages/publishers/PublisherPageCTA'

export const metadata = { title: 'For Publishers — Mlytics Decision Engine' }

export default function PublishersPage() {
  return (
    <>
      {/* Hero + Agent continuation — first thing visitors see */}
      <PublisherAgentContinuation />

      {/* Layer overview */}
      <section className="section-white py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#1A1A1A' }}>Three layers. One integration.</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                layer: 'Layer 1',
                name: 'Decisive Engine',
                price: '$1,000/mo',
                desc: 'Content delivery <50ms. TCO reduced 20%. One API to replace your CDN contracts.',
                icon: '⚡',
              },
              {
                layer: 'Layer 2',
                name: 'AIGC Widget',
                price: '$5,000/mo',
                desc: '$0.10/article. 2,500× human productivity. Every article captures reader intent.',
                icon: '✍️',
              },
              {
                layer: 'Layer 3',
                name: 'Full Conversation CPL',
                price: 'Revenue share',
                desc: 'Your strong-intent readers matched to brands. You earn CPL revenue from content you already have.',
                icon: '💬',
              },
            ].map(item => (
              <div key={item.layer} className="rounded-2xl p-5 border" style={{ borderColor: '#E5E5E5' }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,93,89,0.08)', color: '#225D59' }}>
                    {item.layer}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>{item.name}</h3>
                <p className="text-xs font-semibold mb-2" style={{ color: '#225D59' }}>{item.price}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#6B6B6B' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RevenueCalculator />
      <PublisherPageCTA />
    </>
  )
}
