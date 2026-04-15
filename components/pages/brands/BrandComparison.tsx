'use client'

import { motion } from 'framer-motion'

const ROWS = [
  ['Billing',      'Per 1,000 impressions',     'Per intent signal'],
  ['User intent',  'Unknown',                   '⚡ Verified in real-time'],
  ['What you get', 'Unqualified eyeballs',      'In-market readers'],
  ['ROI model',    'Spend first, measure later', 'Pay for verified outcomes'],
  ['Discovery',    'DIY SEO / GEO',             'Distributed across 15M+ MAU'],
] as const

export function BrandComparison() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
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
          {ROWS.map(([label, cpm, cpl], i) => (
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
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            >
              {/* Label bar */}
              <div
                className="px-5 py-3 border-b flex items-center justify-between"
                style={{ background: '#FFFFFF', borderColor: '#EEEEEE' }}
              >
                <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{label}</span>
                {/* Column mini-labels on mobile */}
                <div className="flex gap-4 sm:hidden text-[10px] font-semibold uppercase tracking-wider">
                  <span style={{ color: '#C8C8C8' }}>CPM</span>
                  <span style={{ color: '#225D59' }}>Mlytics</span>
                </div>
              </div>

              {/* Value panels */}
              <div className="grid grid-cols-2 sm:grid-cols-[1fr_40px_1fr]">
                {/* Traditional CPM — muted */}
                <div className="p-4 flex items-center justify-center" style={{ background: '#F7F7F7' }}>
                  <p className="text-xs text-center leading-relaxed" style={{ color: '#BBBBBB' }}>{cpm}</p>
                </div>

                {/* Arrow divider — desktop only */}
                <div
                  className="hidden sm:flex items-center justify-center border-l border-r"
                  style={{ background: '#FAFAFA', borderColor: '#EEEEEE' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7.5 3L12 7l-4.5 4" stroke="#225D59" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Mlytics — highlighted */}
                <div
                  className="p-4 flex items-center justify-center border-l sm:border-l-0"
                  style={{ background: 'rgba(34,93,89,0.04)', borderColor: 'rgba(34,93,89,0.12)' }}
                >
                  <p className="text-xs font-semibold text-center leading-relaxed" style={{ color: '#225D59' }}>{cpl}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Column footer labels — desktop */}
        <motion.div
          className="hidden sm:grid grid-cols-[1fr_40px_1fr] mt-3 px-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-center" style={{ color: '#C8C8C8' }}>
            Traditional CPM
          </p>
          <div />
          <p className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: '#225D59' }}>
            Mlytics Decision Engine
          </p>
        </motion.div>
      </div>
    </section>
  )
}
