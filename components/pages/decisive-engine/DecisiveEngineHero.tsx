'use client'

import { motion } from 'framer-motion'
import { CdnQualityCard } from '@/components/pages/decisive-engine/CdnQualityCard'

const PILLS = [
  'Real User Monitoring',
  'Synthetic Monitoring',
  'ISP / ASN Intelligence',
  'Multi-CDN Steering',
  'Origin Optimization',
]

const STATS = [
  { label: 'RUM + Synthetic', desc: 'Two complementary data sources' },
  { label: 'Cross-provider', desc: 'Decisions across multiple CDNs' },
  { label: 'ISP-aware', desc: 'Market and network granularity' },
  { label: 'Closed loop', desc: 'Telemetry converted into action' },
]

export function DecisiveEngineHero() {
  return (
    <section className="section-dark pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Hero — eyebrow, h1, lead, pills. Nothing else. */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          {/* Pill badge — same markup/inline-style as app/developers/page.tsx and
              components/not-found/NotFoundContent.tsx's .nf-cdn variant. Keep all
              three identical. */}
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(34,93,89,0.4)',
              color: 'var(--color-on-dark)',
              border: '1px solid rgba(34,93,89,0.6)',
            }}
          >
            Mlytics Multi-CDN Intelligence
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-none mb-5">
            Route. Observe.{' '}
            <span className="block text-on-dark">Decide.</span>
          </h1>

          <p className="text-base max-w-xl mx-auto text-on-dark">
            Decisive Engine turns real-world network data into active Multi-CDN traffic
            decisions—helping every market use the right delivery path at the right moment.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {PILLS.map((pill) => (
              <span
                key={pill}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-on-dark"
                style={{
                  background: 'rgba(168,197,195,0.08)',
                  border: '1px solid rgba(168,197,195,0.25)',
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Context band — CdnQualityCard + stat strip, kept on the same dark
            background so it reads as a continuation of the hero rather than a
            new topic. */}
        <motion.div
          className="max-w-md mx-auto mt-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <CdnQualityCard />
        </motion.div>

        <div
          className="grid grid-cols-2 lg:grid-cols-4 mt-8 rounded-2xl overflow-hidden gap-px p-px"
          style={{
            background: 'rgba(168,197,195,0.25)',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="p-5 bg-primary-dark">
              <p className="text-base font-bold text-on-dark mb-1">{stat.label}</p>
              <p className="text-sm text-on-dark/85">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
