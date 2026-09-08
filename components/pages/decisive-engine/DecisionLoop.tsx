'use client'

import { motion } from 'framer-motion'
import { Radar, Scale, Route } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const OBSERVE_TAGS = ['Real users', 'Synthetic probes', 'Service health']

const DECIDE_TAGS = ['Performance', 'Availability', 'Capacity', 'Traffic share', 'Cost', 'Manual control']

const ROUTE_TAGS = ['Multiple CDNs', 'Origin Shield', 'Applications']

const STEPS: { title: string; body: string; Icon: LucideIcon; tags: string[] }[] = [
  {
    title: 'Observe',
    body: 'Combine RUM and synthetic measurements across countries, regions, ISPs, ASNs, CDN providers, time windows, and content types.',
    Icon: Radar,
    tags: OBSERVE_TAGS,
  },
  {
    title: 'Decide',
    body: 'Evaluate availability, latency, TTFB, download performance, capacity, traffic ratios, cost conditions, and customer-defined policy.',
    Icon: Scale,
    tags: DECIDE_TAGS,
  },
  {
    title: 'Route',
    body: 'Steer traffic through DNS and Multi-CDN orchestration, moving each market toward an appropriate healthy delivery path.',
    Icon: Route,
    tags: ROUTE_TAGS,
  },
]

export function DecisionLoop() {
  return (
    <section className="section-light py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-11"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3 block">The decision loop</Eyebrow>
          <h2 className="section-heading text-ink mb-4">Monitoring becomes routing action.</h2>
          <p className="text-base text-ink-muted">
            Decisive Engine connects visibility, policy, and execution in one operating model.
            Traffic decisions continuously reflect real user experience, active tests, service
            health, and business priorities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((item, i) => (
            <motion.article
              key={item.title}
              className="flex flex-col rounded-2xl border border-line bg-white p-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' }}
            >
              {/* Shared min-height keeps the divider below at the same y across
                  all three cards, regardless of how many lines the body
                  paragraph wraps to. Pills flow beneath it instead of being
                  pinned to the card bottom, so a shorter tag block just
                  leaves trailing space — which reads as deliberate. */}
              <div className="min-h-[16.5rem]">
                <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-primary text-white mb-7">
                  <item.Icon size={22} strokeWidth={1.6} />
                </span>
                <h3 className="text-2xl font-bold text-ink mb-3">{item.title}</h3>
                <p className="text-sm text-ink-muted">{item.body}</p>
              </div>

              <div className="mt-5 pt-5 border-t border-line flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/8 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
