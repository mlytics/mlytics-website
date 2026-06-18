'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, TrendingDown, ShieldCheck, Plug, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const SPECS: { stat: string; label: string; Icon: LucideIcon }[] = [
  { stat: '< 50ms',  label: 'P99 decision latency',           Icon: Zap },
  { stat: '20%',     label: 'TCO reduction baseline',          Icon: TrendingDown },
  { stat: '99.99%',  label: 'Reliability & SLA guarantee',     Icon: ShieldCheck },
  { stat: '1 API',   label: 'Replaces multiple CDN contracts',  Icon: Plug },
  { stat: '18+',     label: 'Countries in network',             Icon: Globe },
]

export function DeveloperSpecs() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-white py-16 lg:py-20" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3">
            Performance Specs
          </Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-ink">
            What does production-grade AI content delivery infrastructure actually require?
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {SPECS.map((item, i) => (
            <motion.div
              key={item.label}
              className="text-center p-5 rounded-2xl border last:col-span-2 lg:last:col-span-1 border-line bg-surface"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: 'easeOut' }}
            >
              <div className="flex justify-center mb-2">
                <item.Icon size={22} strokeWidth={1.6} className="text-primary" />
              </div>
              <p className="text-xl font-bold mb-1 text-primary">{item.stat}</p>
              <p className="text-xs text-ink-muted">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
