'use client'

import Link from 'next/link'

const CARDS = [
  {
    persona: 'Publisher',
    emoji: '📰',
    hook: 'Your content produces reader intent signals every day. Right now, every single one is leaking away.',
    products: 'AIGC Widget · CPL Revenue',
    metrics: [
      { label: 'Content cost', value: '$0.10/piece' },
      { label: 'vs. human writing', value: '$250/piece' },
    ],
    cta: 'See publisher plan',
    href: '/publishers',
    accent: '#225D59',
  },
  {
    persona: 'Brand',
    emoji: '🎯',
    hook: 'How much of your ad budget hits people with zero purchase intent? You can stop guessing.',
    products: 'Full Conversation CPL · Lead Pilot',
    metrics: [
      { label: 'Qualified lead', value: '$512' },
      { label: 'Confidence', value: '87%' },
    ],
    cta: 'See brand plan',
    href: '/brands',
    accent: '#225D59',
  },
  {
    persona: 'Developer',
    emoji: '⚙️',
    hook: 'Your content delivery infrastructure costs more than it should. One API call changes that.',
    products: 'Decisive Engine API',
    metrics: [
      { label: 'TCO reduction', value: '20%' },
      { label: 'Decision latency', value: '< 50ms' },
    ],
    cta: 'See developer plan',
    href: '/developers',
    accent: '#225D59',
  },
]

export function IdentityCards() {
  return (
    <section className="section-light py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            Who are you?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Find your entry point</h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6B6B6B' }}>
            Three types of customers, one Decision Engine. Choose your role to see what it means for you specifically.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 flex flex-col gap-5 border transition-shadow duration-300 hover:shadow-lg"
              style={{ borderColor: '#E5E5E5', transform: 'translateZ(0)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl mb-2 block">{card.emoji}</span>
                  <h3 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>{card.persona}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#9B9B9B' }}>{card.products}</p>
                </div>
              </div>

              {/* Hook */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#6B6B6B', backfaceVisibility: 'hidden' }}>{card.hook}</p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2">
                {card.metrics.map((m, j) => (
                  <div key={j} className="px-3 py-2.5 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5 whitespace-nowrap" style={{ color: '#9B9B9B' }}>{m.label}</p>
                    <p className="text-sm font-bold" style={{ color: card.accent }}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={card.href}
                className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: card.accent }}
              >
                {card.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
