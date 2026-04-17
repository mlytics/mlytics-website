'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, TrendingDown, ShieldCheck, Plug, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            Performance Specs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#1A1A1A' }}>
            Built for production-grade infrastructure.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {SPECS.map((item, i) => (
            <motion.div
              key={item.label}
              className="text-center p-5 rounded-2xl border last:col-span-2 md:last:col-span-1"
              style={{ borderColor: '#E5E5E5', background: '#FAFAFA' }}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: 'easeOut' }}
            >
              <div className="flex justify-center mb-2">
                <item.Icon size={22} strokeWidth={1.6} style={{ color: '#225D59' }} />
              </div>
              <p className="text-xl font-bold mb-1" style={{ color: '#225D59' }}>{item.stat}</p>
              <p className="text-xs" style={{ color: '#6B6B6B' }}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
