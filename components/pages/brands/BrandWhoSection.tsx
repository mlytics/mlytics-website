'use client'

import { motion } from 'framer-motion'

const VERTICALS = [
  { icon: '🏦', label: 'Financial Services', desc: 'Banks, insurance, investment funds' },
  { icon: '👟', label: 'Consumer Brands', desc: 'Products with considered purchases' },
  { icon: '❤️', label: 'Health & Wellness', desc: 'Research-heavy buying decisions' },
  { icon: '🚗', label: 'Automotive', desc: 'High-intent, long consideration cycles' },
  { icon: '💻', label: 'Technology', desc: 'B2C and prosumer software & hardware' },
]

export function BrandWhoSection() {
  return (
    <section className="section-light py-14 lg:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            Who this is for
          </span>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#1A1A1A' }}>
            For brand marketers tired of paying for impressions that don't convert.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {VERTICALS.map((v, i) => (
            <motion.div
              key={i}
              className="text-center p-4 rounded-2xl"
              style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.07, ease: 'easeOut' }}
            >
              <span className="text-2xl block mb-2">{v.icon}</span>
              <p className="text-xs font-bold mb-1" style={{ color: '#1A1A1A' }}>{v.label}</p>
              <p className="text-[10px] leading-relaxed" style={{ color: '#9B9B9B' }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
