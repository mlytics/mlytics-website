'use client'

import { motion } from 'framer-motion'
import { Target, BarChart2, Package, Coins } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const STEPS: { step: string; label: string; Icon: LucideIcon }[] = [
  { step: '01', label: 'Strong intent detected', Icon: Target },
  { step: '02', label: 'Scored & qualified',      Icon: BarChart2 },
  { step: '03', label: 'Delivered to your CRM',   Icon: Package },
  { step: '04', label: 'Pay per result',           Icon: Coins },
]

export function BrandLeadPilot() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3">
            Lead Pilot
          </Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-ink">
            How does intent-based lead generation through publisher networks work?
          </h2>
          <p className="text-base max-w-xl mx-auto text-ink-muted">
            Lead Pilot qualifies, scores, and delivers ready-to-close leads to your sales team — in your CRM format.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              className="text-center p-5 rounded-2xl border border-line"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              <div className="flex justify-center mb-3">
                <item.Icon size={22} strokeWidth={1.6} className="text-primary" />
              </div>
              <Eyebrow className="block mb-1.5 text-ink-subtle">
                {item.step}
              </Eyebrow>
              <span className="text-sm font-semibold text-ink">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
