'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

const STEPS = [
  {
    num: '01',
    label: 'Turn your Answer Engine on',
    desc: 'Your digital asset library becomes structured Answer pages — AI-ready inventory for brand participation.',
  },
  {
    num: '02',
    label: 'Start with Branded Answers',
    desc: 'Approved brand placements appear within relevant Answer pages.',
  },
  {
    num: '03',
    label: 'Earn from qualified brand interactions',
    desc: 'Qualified brand activity within your digital assets earns revenue share, tracked transparently.',
  },
]

export function PartnershipHowItWorks() {
  return (
    <section className="section-white pt-16 lg:pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3">How It Works</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-ink">
            How do media partners activate and earn?
          </h2>
          <p className="text-base max-w-xl mx-auto text-ink-muted">
            AI search is reshaping how audiences find content — media and content partners who activate early unlock new inventory for brand participation and AEO monetization.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden md:block absolute left-0 right-0 pointer-events-none"
            style={{ height: 1, top: '4px', background: 'rgba(0,0,0,0.1)' }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col pr-0 md:pr-10 pb-10 md:pb-0"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.12, ease: 'easeOut' }}
            >
              {/* Dot */}
              <div
                className="hidden md:block w-[10px] h-[10px] rounded-full mb-6 relative z-10 shrink-0 bg-primary"
              />
              <span
                className="text-xs font-bold tabular-nums mb-2"
                style={{ color: 'rgba(107,107,107,0.5)' }}
              >
                {step.num}
              </span>
              <p className="text-base font-bold mb-2 leading-snug text-ink">{step.label}</p>
              <p className="text-sm leading-relaxed text-ink-muted">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
