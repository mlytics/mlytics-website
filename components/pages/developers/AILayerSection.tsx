'use client'

import { motion } from 'framer-motion'

const COMPARISONS = [
  {
    num: '01',
    label: 'Request routing',
    before: 'Route request to optimal CDN origin',
    after: 'Same routing — plus intent signal captured',
  },
  {
    num: '02',
    label: 'Performance SLA',
    before: 'Enforce performance SLA < 50ms',
    after: 'Same SLA — plus reader behaviour classified',
  },
  {
    num: '03',
    label: 'Security layer',
    before: 'Apply WAF & security rules',
    after: 'Same security — plus content context indexed',
  },
  {
    num: '04',
    label: 'Event logging',
    before: 'Log delivery event',
    after: 'Same log — now feeds the AI inference layer',
  },
]

export function AILayerSection() {
  return (
    <section className="section-dark py-16 lg:py-20 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 700px 400px at 50% 50%, rgba(34,93,89,0.18) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,197,195,0.55)' }}>
            AI-Era Infrastructure
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            You already need CDN routing.
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            With Mlytics, every routing decision also feeds an AI intelligence layer — same cost, more value.
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="space-y-3">
          {COMPARISONS.map((item, i) => (
            <motion.div
              key={i}
              className="group rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(34,93,89,0.14)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(34,93,89,0.08)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            >
              <div className="grid md:grid-cols-[1fr_40px_1fr]">
                {/* Left — Before (muted) */}
                <div className="p-5 flex flex-col gap-2" style={{ background: '#F7F7F7' }}>
                  <p className="text-xs font-semibold" style={{ color: '#9B9B9B' }}>{item.label}</p>
                  <div className="relative inline-block">
                    <p className="text-sm leading-relaxed" style={{ color: '#BBBBBB' }}>{item.before}</p>
                    <motion.div
                      className="absolute left-0 top-1/2 h-px pointer-events-none"
                      style={{ background: '#AAAAAA', right: 0 }}
                      initial={{ scaleX: 0, originX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                {/* Arrow divider */}
                <div className="hidden md:flex items-center justify-center border-l border-r" style={{ background: '#FAFAFA', borderColor: '#EEEEEE' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7.5 3L12 7l-4.5 4" stroke="#225D59" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Right — Mlytics */}
                <div className="p-5 flex flex-col gap-2" style={{ background: '#F7F9F8', borderLeft: '2px solid rgba(34,93,89,0.2)' }}>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#225D59' }}>Mlytics</span>
                  <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>{item.after}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result — large emerging text */}
        <div className="mt-20 text-center relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 60%, rgba(34,93,89,0.45) 0%, transparent 70%)' }}
          />

          <motion.div
            className="mx-auto mb-8"
            style={{ width: 40, height: 1, background: 'rgba(168,197,195,0.3)' }}
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          <motion.p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'rgba(168,197,195,0.5)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Same API contract
          </motion.p>
          <motion.h3
            className="text-4xl md:text-6xl font-bold leading-tight relative text-white"
            initial={{ opacity: 0, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Every request builds
            <span className="block">the intelligence layer.</span>
          </motion.h3>
        </div>
      </div>
    </section>
  )
}
