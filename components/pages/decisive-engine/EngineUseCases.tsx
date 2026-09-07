'use client'

import { motion } from 'framer-motion'
import { Gamepad2, Dices, Tv, ShoppingCart, Webhook, Bot, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const CASES: { title: string; body: string; Icon: LucideIcon }[] = [
  { title: 'Gaming & large updates', body: 'Distribute launch peaks and high-concurrency downloads across CDNs while Origin Shield reduces repeated origin pressure.', Icon: Gamepad2 },
  { title: 'Sportsbook & iGaming', body: 'Use dynamic endpoint and long-connection quality to steer real-time odds, API, SSE, and WebSocket traffic.', Icon: Dices },
  { title: 'OTT, VoD & live events', body: 'Allocate traffic using regional quality, availability, and capacity during media peaks and major broadcasts.', Icon: Tv },
  { title: 'Global commerce', body: 'Adapt CDN selection to changing country and ISP conditions across storefront assets and dynamic transactions.', Icon: ShoppingCart },
  { title: 'APIs & dynamic apps', body: 'Measure application endpoints through different CDNs and use end-to-end service quality in routing decisions.', Icon: Webhook },
  { title: 'AI Gateway', body: 'Improve user-to-gateway network paths and streaming stability while integrating DDoS, WAF, API, and bot protection.', Icon: Bot },
  { title: 'China outbound', body: 'Use market and ISP measurements to select delivery paths for cross-border and locally diverse network conditions.', Icon: Globe },
]

export function EngineUseCases() {
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
          <Eyebrow className="mb-3 block">High-value use cases</Eyebrow>
          <h2 className="section-heading text-ink">
            Built for delivery that changes by market and moment.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {CASES.map((item, i) => (
            <motion.article
              key={item.title}
              className="grid grid-cols-[3rem_1fr] gap-4 rounded-2xl border border-line bg-surface p-6 last:sm:col-span-2"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.08, ease: 'easeOut' }}
            >
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary text-white">
                <item.Icon size={22} strokeWidth={1.6} />
              </span>
              <div>
                <h3 className="text-2xl font-bold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-ink-muted">{item.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
