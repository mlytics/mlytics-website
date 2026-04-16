'use client'

import { motion } from 'framer-motion'

const STEPS = [
  { step: '01', label: 'Strong intent detected', icon: '🎯' },
  { step: '02', label: 'Scored & qualified', icon: '📊' },
  { step: '03', label: 'Delivered to your CRM', icon: '📦' },
  { step: '04', label: 'Pay per result', icon: '💰' },
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
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            Lead Pilot
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Intent found. We handle the rest.
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#6B6B6B' }}>
            Lead Pilot qualifies, scores, and delivers ready-to-close leads to your sales team — in your CRM format.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              className="text-center p-5 rounded-2xl border"
              style={{ borderColor: '#E5E5E5' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              <span className="text-2xl block mb-3">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#9B9B9B' }}>
                {item.step}
              </span>
              <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
