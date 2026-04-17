'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Newspaper, Target, Settings2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CARDS: Array<{
  persona: string
  Icon: LucideIcon
  hook: string
  products: string
  metrics: { label: string; value: string }[]
  cta: string
  href: string
  accent: string
}> = [
  {
    persona: 'Content Owner',
    Icon: Newspaper,
    hook: 'Your content produces reader intent signals every day. Right now, every single one is leaking away.',
    products: 'AI Q&A Widget · CPL Revenue',
    metrics: [
      { label: 'Content cost', value: '$0.10/piece' },
      { label: 'vs. human writing', value: '$250/piece' },
    ],
    cta: 'See content owner plan',
    href: '/content-owners',
    accent: '#225D59',
  },
  {
    persona: 'Brand',
    Icon: Target,
    hook: 'How much of your ad budget hits people with zero purchase intent? You can stop guessing.',
    products: 'Full Conversation CPL · Lead Pilot',
    metrics: [
      { label: 'Lower CAC', value: '60%+' },
      { label: 'ROI timeline', value: '60 days' },
    ],
    cta: 'See brand plan',
    href: '/brands',
    accent: '#225D59',
  },
  {
    persona: 'Developer',
    Icon: Settings2,
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
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            Who are you?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Find your entry point</h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6B6B6B' }}>
            Three types of customers, one Decision Engine. Choose your role to see what it means for you specifically.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-6 flex flex-col gap-5 border transition-shadow duration-300 hover:shadow-lg"
              style={{ borderColor: '#E5E5E5' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,93,89,0.08)' }}>
                    <card.Icon size={17} strokeWidth={1.8} style={{ color: '#225D59' }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>{card.persona}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#9B9B9B' }}>{card.products}</p>
                </div>
              </div>

              {/* Hook */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#6B6B6B', backfaceVisibility: 'hidden' }}>{card.hook}</p>

              {/* Metrics — hidden */}
              {/* <div className="grid grid-cols-2 gap-2">
                {card.metrics.map((m, j) => (
                  <div key={j} className="px-3 py-2.5 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5 whitespace-nowrap" style={{ color: '#9B9B9B' }}>{m.label}</p>
                    <p className="text-sm font-bold" style={{ color: card.accent }}>{m.value}</p>
                  </div>
                ))}
              </div> */}

              {/* CTA */}
              <Link
                href={card.href}
                className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: card.accent }}
              >
                {card.cta} →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
