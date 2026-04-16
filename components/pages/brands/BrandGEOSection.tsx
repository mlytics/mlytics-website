'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    label: 'Your brand content, indexed',
    desc: 'We ingest and structure your brand messaging, product pages, and editorial content into our AI knowledge layer.',
  },
  {
    num: '02',
    label: 'Mlytics GEO engine activates',
    desc: 'Our Generative Engine Optimization layer surfaces your brand as a relevant reference when readers ask AI-powered questions in your vertical — across all 15M+ MAU.',
  },
  {
    num: '03',
    label: 'You get the citations',
    desc: 'Your brand appears contextually inside AI answers readers trust — not as an ad, but as the right answer at the right moment. We do the work. You get the citations.',
  },
]

export function BrandGEOSection() {
  return (
    <section className="section-dark py-16 lg:py-20 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 600px 350px at 60% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F59E0B' }}>
            GEO — Generative Engine Optimization
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Stop doing GEO yourself.<br />
            <span style={{ color: '#F59E0B' }}>We cover the entire network.</span>
          </h2>
          <p className="text-base max-w-xl" style={{ color: '#A8C5C3' }}>
            Mlytics handles GEO across our entire content owner network. Your brand appears as a relevant reference when readers ask AI-powered questions about your vertical.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(245,158,11,0.2)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(245,158,11,0.06)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              <div
                className="px-5 py-3 border-b flex items-center justify-between"
                style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' }}
              >
                <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>{step.label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: 'rgba(245,158,11,0.5)' }}>{step.num}</span>
              </div>
              <div className="px-5 py-4" style={{ background: 'rgba(245,158,11,0.03)' }}>
                <p className="text-sm leading-relaxed" style={{ color: '#A8C5C3' }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
