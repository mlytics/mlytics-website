'use client'

import { motion } from 'framer-motion'

const ROWS = [
  { label: 'Billing',      cpm: 'Per 1,000 impressions',              mlytics: 'Per qualified intent signal' },
  { label: 'User intent',  cpm: 'Unknown — hope-based targeting',     mlytics: 'Verified — real-time intent classification' },
  { label: 'What you get', cpm: 'Eyeballs that may or may not care',  mlytics: 'Readers actively researching your category' },
  { label: 'ROI model',    cpm: 'Spend first, measure later',         mlytics: 'Outcome-based — pay for verified engagement' },
  { label: 'Discovery',    cpm: 'You do SEO / GEO yourself',          mlytics: 'Mlytics GEO places your brand across 15M+ MAU network' },
]

export function BrandComparison() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
            The Difference
          </span>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#1A1A1A' }}>
            Intent vs. traditional CPM
          </h2>
        </motion.div>

        {/* Row cards */}
        <div className="space-y-3">
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(34,93,89,0.14)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(34,93,89,0.08)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              {/* Label bar */}
              <div
                className="px-5 py-3 flex items-center justify-between border-b"
                style={{ background: '#FFFFFF', borderColor: '#EEEEEE' }}
              >
                <span className="text-sm font-bold" style={{ color: '#225D59' }}>{row.label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: '#225D59', opacity: 0.7 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Contrast panels */}
              <div className="grid md:grid-cols-[1fr_40px_1fr]">
                {/* Left — Traditional CPM (muted) */}
                <div className="p-5 flex flex-col gap-2" style={{ background: '#F7F7F7' }}>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#CCCCCC' }}>
                    Traditional CPM
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#BBBBBB' }}>
                    {row.cpm}
                  </p>
                </div>

                {/* Arrow divider — desktop only */}
                <div
                  className="hidden md:flex items-center justify-center border-l border-r"
                  style={{ background: '#FAFAFA', borderColor: '#EEEEEE' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7.5 3L12 7l-4.5 4" stroke="#225D59" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Right — Mlytics (highlighted) */}
                <div
                  className="p-5 flex flex-col gap-2 border-t md:border-t-0 border-l-0 md:border-l"
                  style={{ background: 'rgba(34,93,89,0.04)', borderColor: 'rgba(34,93,89,0.12)' }}
                >
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#225D59' }}>
                    Mlytics
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>
                    {row.mlytics}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
