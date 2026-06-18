'use client'

import { motion } from 'framer-motion'

const POINTS = [
  {
    title: 'AI search is reshaping discovery',
    desc: 'AI search is changing how audiences discover and engage with content. The way readers find answers is shifting — and the monetization model needs to shift with it.',
  },
  {
    title: 'Early activators build new inventory',
    desc: 'Publishers that activate their content early can create new inventory for brand participation, AI-powered engagement, and AEO monetization.',
  },
  {
    title: 'Infrastructure already in place',
    desc: 'Mlytics helps you get there — with the platform, workflow, and brand delivery infrastructure already built.',
  },
]

export function PartnershipOpportunity() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#B45309' }}
          >
            The Opportunity
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight text-ink">
            How is AI search changing content monetization?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {POINTS.map((point, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-6 bg-surface"
              style={{ border: '1px solid #E5E5E5' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
            >
              <span
                className="text-xs font-bold tabular-nums mb-2 block"
                style={{ color: 'rgba(107,107,107,0.5)' }}
              >
                0{i + 1}
              </span>
              <p className="text-sm font-semibold mb-2 leading-snug text-ink">
                {point.title}
              </p>
              <p className="text-sm leading-relaxed text-ink-muted">
                {point.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
