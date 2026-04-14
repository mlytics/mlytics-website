'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { NumberTicker } from '@/components/ui/NumberTicker'

const STATS = [
  { value: 60, suffix: '%', desc: 'searches end without a click', source: 'SparkToro / Datos 2024' },
  { value: 77, suffix: '%', desc: 'zero-click rate on mobile', source: 'Up & Social 2025' },
  { value: 85, suffix: '%', desc: 'zero-click with AI Overviews', source: 'Similarweb 2025' },
  { value: 40, suffix: '%', desc: 'CTR drop on informational queries', source: 'BrightEdge 2024–2025' },
]

export function ZeroClickSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-white py-16 lg:py-20" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#B45309' }}
          >
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ color: '#1A1A1A' }}>
            The zero-click economy<br />
            <span style={{ color: '#B45309' }}>is already here.</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6B6B6B' }}>
            LLM search now intercepts your readers before they reach your site.
            Page views decline. Ad revenue follows.
          </p>
        </motion.div>

        {/* Stat cards — staggered entrance + count-up */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((item, i) => (
            <motion.div
              key={i}
              className="text-center p-5 rounded-2xl flex flex-col gap-2"
              style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease: 'easeOut' }}
            >
              <p className="text-4xl md:text-5xl font-bold" style={{ color: '#D97706' }}>
                {inView
                  ? <NumberTicker value={item.value} suffix={item.suffix} duration={900} />
                  : `0${item.suffix}`}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#1A1A1A' }}>{item.desc}</p>
              <p className="text-xs mt-auto" style={{ color: '#9B9B9B' }}>{item.source}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
