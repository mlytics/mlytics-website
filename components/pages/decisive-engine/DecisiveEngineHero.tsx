'use client'

import { motion } from 'framer-motion'

const PILLS = [
  'Real User Monitoring',
  'Synthetic Monitoring',
  'ISP / ASN Intelligence',
  'Multi-CDN Steering',
  'Origin Optimization',
]

const STATS = ['RUM + Synthetic', 'Cross-provider', 'ISP-aware', 'Closed loop']

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

          {/* Two pill groups — capability pills, then stat pills — styled
              identically so they read as one calm pill block. space-y-3
              between the rows gives just enough separation to tell the two
              groups apart without splitting them into competing bands. */}
          <div className="mt-8 space-y-3">
            <div className="flex flex-wrap justify-center gap-2">
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
            <div className="flex flex-wrap justify-center gap-2">
              {STATS.map((stat) => (
                <span
                  key={stat}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-on-dark"
                  style={{
                    background: 'rgba(168,197,195,0.08)',
                    border: '1px solid rgba(168,197,195,0.25)',
                  }}
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
