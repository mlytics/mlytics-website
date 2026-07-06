'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Newspaper, Target, Settings2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const CARDS: Array<{
  persona: string
  Icon: LucideIcon
  hook: string
  products: string
  metrics: { label: string; value: string }[]
  cta: string
  ctaShort?: string
  href: string
  accent: string
}> = [
  {
    persona: 'Media and Content Owner',
    Icon: Newspaper,
    hook: "85% of searches end without a click — Mlytics Cortex captures your readers' intent and turns it into three new revenue streams.",
    products: 'AI Q&A Widget · CPL Revenue',
    metrics: [
      { label: 'Content cost', value: '$0.10/piece' },
      { label: 'vs. human writing', value: '$250/piece' },
    ],
    cta: 'See media and content plan',
    ctaShort: 'See media & content plan',
    href: '/content-owners',
    accent: 'var(--color-primary)',
  },
  {
    persona: 'Brand',
    Icon: Target,
    hook: "60%+ of buyers get answers from AI without clicking through — Mlytics Cortex places your brand inside the answers they trust.",
    products: 'Full Conversation CPL · Lead Pilot',
    metrics: [
      { label: 'Lower CAC', value: '60%+' },
      { label: 'ROI timeline', value: '60 days' },
    ],
    cta: 'See brand plan',
    href: '/brands',
    accent: 'var(--color-primary)',
  },
  {
    persona: 'Developer',
    Icon: Settings2,
    hook: "Fragmented CDN contracts and rising infra costs don't have to be trade-offs — Mlytics Cortex cuts TCO by 20% and routes every request in under 50ms, through one API.",
    products: 'Decisive Engine API',
    metrics: [
      { label: 'TCO reduction', value: '20%' },
      { label: 'Decision latency', value: '< 50ms' },
    ],
    cta: 'See developer plan',
    href: '/developers',
    accent: 'var(--color-primary)',
  },
]

export function IdentityCards() {
  return (
    <section className="section-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3">
            Who are you?
          </Eyebrow>
          <h2 className="section-heading mb-4 text-ink">What does Mlytics Cortex offer brands, media and content owners, and developers?</h2>
          <p className="text-base max-w-xl mx-auto text-ink-muted">
            Three types of customers, one Mlytics Cortex. Choose your role to see what it means for you specifically.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-6 flex flex-col gap-5 border border-line transition-shadow duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 w-8 h-8 rounded-lg flex items-center justify-center bg-primary/8">
                    <card.Icon size={17} strokeWidth={1.8} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">{card.persona}</h3>
                  <p className="text-sm mt-0.5 text-ink-subtle">{card.products}</p>
                </div>
              </div>

              {/* Hook */}
              <p className="text-sm md:text-base leading-relaxed flex-1 text-ink-muted" style={{ backfaceVisibility: 'hidden' }}>{card.hook}</p>

              {/* Metrics — hidden */}
              {/* <div className="grid grid-cols-2 gap-2">
                {card.metrics.map((m, j) => (
                  <div key={j} className="px-3 py-2.5 rounded-xl bg-surface border border-line">
                    <p className="label-eyebrow mb-0.5 whitespace-nowrap text-ink-subtle">{m.label}</p>
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
                {card.ctaShort ? (
                  <>
                    {/* Tablet (md–lg) squeezes three columns; show the shorter copy there */}
                    <span className="md:hidden lg:inline">{card.cta}</span>
                    <span className="hidden md:inline lg:hidden">{card.ctaShort}</span>
                  </>
                ) : (
                  card.cta
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
