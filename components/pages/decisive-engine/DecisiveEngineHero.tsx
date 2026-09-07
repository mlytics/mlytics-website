'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'
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
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <Eyebrow dark className="mb-4 block">
              Mlytics Multi-CDN Intelligence
            </Eyebrow>

            <h1 className="text-display font-bold text-white leading-none mb-5">
              Route. Observe.
              <span className="block text-on-dark">Decide.</span>
            </h1>

            <p className="text-base max-w-xl text-on-dark">
              Decisive Engine turns real-world network data into active Multi-CDN traffic
              decisions—helping every market use the right delivery path at the right moment.
            </p>

            <div className="flex flex-wrap gap-2 mt-8">
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

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <CdnQualityCard />
          </motion.div>
        </div>

        <div
          className="grid grid-cols-2 lg:grid-cols-4 mt-14 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(168,197,195,0.06)',
            border: '1px solid rgba(168,197,195,0.25)',
          }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="p-5"
              style={{ borderBottom: '1px solid rgba(168,197,195,0.12)' }}
            >
              <p className="text-base font-bold text-on-dark mb-1">{stat.label}</p>
              <p className="text-sm text-on-dark/70">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
