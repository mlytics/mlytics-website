'use client'

import { useContactModal } from '@/context/contact-modal-context'

const CASES = [
  {
    industry: 'Digital Media',
    tag: 'AIGC Widget',
    tagColor: '#225D59',
    bigNumber: '2,500×',
    bigDesc: 'Content production efficiency',
    headline: 'Content team cut production cost from $250 to $0.10 per piece',
    body: 'Facing AI-era traffic decline, this digital publisher deployed AIGC Widget. Every article now generates intent signals and companion content at near-zero marginal cost.',
    icon: '📰',
  },
  {
    industry: 'Financial Services',
    tag: 'Full Conversation CPL',
    tagColor: '#225D59',
    bigNumber: '$512',
    bigDesc: 'Per qualified lead, 87% confidence',
    headline: 'Shifted from CPM impressions to buying confirmed purchase intent',
    body: 'This financial brand stopped buying unqualified CPM reach and now only pays for strong-intent leads identified in our 4M WAU network. ROI is fully predictable.',
    icon: '🏦',
  },
  {
    industry: 'Content Platform',
    tag: 'Decisive Engine',
    tagColor: '#225D59',
    bigNumber: '20%',
    bigDesc: 'Infrastructure TCO savings',
    headline: 'Content delivery latency dropped below 50ms while cutting monthly costs',
    body: 'By routing all content delivery decisions through Decisive Engine, this platform cut P99 latency to under 50ms and reduced monthly CDN spend by 20% in the first quarter.',
    icon: '⚡',
  },
]

export function CaseStudies() {
  const { open } = useContactModal()

  return (
    <section className="section-dark py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#A8C5C3' }}>
            Case Studies
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            How they use Decision Engine
          </h2>
          <p className="text-base" style={{ color: '#A8C5C3' }}>
            Real results across the refinery chain. Numbers are representative; contact us for verified case details.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {CASES.map((c, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col gap-4 transition-colors duration-200 hover:border-[rgba(168,197,195,0.4)]"
              style={{ background: 'rgba(34,93,89,0.25)', border: '1px solid rgba(34,93,89,0.4)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-xs font-medium" style={{ color: '#A8C5C3' }}>{c.industry}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(168,197,195,0.12)', color: '#A8C5C3', border: '1px solid rgba(168,197,195,0.35)' }}>
                  {c.tag}
                </span>
              </div>

              <div>
                <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{c.bigNumber}</p>
                <p className="text-xs mt-0.5" style={{ color: '#A8C5C3' }}>{c.bigDesc}</p>
              </div>

              <p className="text-sm font-semibold leading-snug text-white">{c.headline}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(168,197,195,0.75)' }}>{c.body}</p>

              <button className="mt-auto text-xs font-medium text-left transition-colors hover:text-white"
                style={{ color: '#A8C5C3' }} onClick={open}>
                Read full case →
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={open}
            className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{ border: '1.5px solid rgba(168,197,195,0.4)', color: '#A8C5C3' }}
          >
            Want to see more cases?
          </button>
        </div>
      </div>
    </section>
  )
}
