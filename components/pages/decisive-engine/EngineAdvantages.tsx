'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

const ADVANTAGES = [
  { num: '01', title: 'Cross-CDN intelligence', body: 'Compare measured quality across providers and convert the result into active traffic steering.' },
  { num: '02', title: 'RUM + synthetic data', body: 'Unify actual last-mile experience with proactive global testing for a fuller quality picture.' },
  { num: '03', title: 'ISP-level precision', body: 'Build strategies around country, region, ISP, ASN, CDN, time window, and content type.' },
  { num: '04', title: 'Availability-first steering', body: 'Use service health, timeouts, connection failures, and errors to keep traffic on healthy paths.' },
  { num: '05', title: 'Bring-your-own CDN', body: 'Monitor customer-provided CDN platforms and include them in Decisive Engine steering.' },
  { num: '06', title: 'Flexible policy', body: 'Combine automation with traffic ratios, thresholds, regional rules, capacity, cost, and manual overrides.' },
  { num: '07', title: 'Transparent decisions', body: 'See quality trends, traffic share, applied strategy, and routing results through Pulse and analytics.' },
  { num: '08', title: 'Origin efficiency', body: 'Consolidate cache misses through Origin Shield to improve tiered-cache efficiency and origin offload.' },
  { num: '09', title: 'Static + dynamic optimization', body: 'Use download and cache signals for assets, and end-to-end availability signals for APIs and applications.' },
]

export function EngineAdvantages() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="mb-11"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3 block">Core advantages</Eyebrow>
          <h2 className="section-heading text-ink mb-4">
            Control across providers, markets, and workloads.
          </h2>
          <p className="text-base max-w-3xl text-ink-muted">
            Mlytics adds an independent decision layer above CDN delivery, giving teams the data
            and control to optimize performance and resilience at global scale.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADVANTAGES.map((item, i) => (
            <motion.article
              key={item.num}
              className="rounded-2xl border border-line bg-surface p-7"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08, ease: 'easeOut' }}
            >
              <span className="label-eyebrow text-primary font-black">{item.num}</span>
              <h3 className="text-2xl font-bold text-ink mt-4 mb-2">{item.title}</h3>
              <p className="text-sm text-ink-muted">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
