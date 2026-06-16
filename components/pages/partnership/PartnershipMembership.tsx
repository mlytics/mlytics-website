'use client'

import { motion } from 'framer-motion'

const INCLUDES = [
  'Access to Mlytics Media Partner Program',
  'AEO platform capabilities',
  'Content activation workflow',
  'Reporting dashboard',
  'Revenue participation opportunities',
  'Up to 10,000 Answer pages activated',
]

export function PartnershipMembership() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#225D59' }}
          >
            Partner Membership
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#1A1A1A' }}>
            What does the Starter Membership include?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* Starter card */}
          <motion.div
            className="rounded-2xl p-8"
            style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <div
              className="flex items-start justify-between gap-4 mb-6 pb-6"
              style={{ borderBottom: '1px solid #E5E5E5' }}
            >
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#9B9B9B' }}>
                  Starter Membership
                </p>
                <p className="text-4xl font-black" style={{ color: '#225D59' }}>
                  US$1,000
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 mt-1"
                style={{
                  background: 'rgba(34,93,89,0.08)',
                  color: '#225D59',
                  border: '1px solid rgba(34,93,89,0.15)',
                }}
              >
                One-time
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {INCLUDES.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: '#1A1A1A' }}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                >
                  <span
                    className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,93,89,0.1)' }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="#225D59"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>

          </motion.div>

          {/* Custom / Enterprise card */}
          <motion.div
            className="rounded-2xl p-8 flex flex-col"
            style={{ background: 'rgba(34,93,89,0.04)', border: '1px solid rgba(34,93,89,0.12)' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
            <div
              className="flex items-start justify-between gap-4 mb-6 pb-6"
              style={{ borderBottom: '1px solid rgba(34,93,89,0.1)' }}
            >
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#9B9B9B' }}>
                  Enterprise
                </p>
                <p className="text-4xl font-black" style={{ color: '#225D59' }}>
                  Custom
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 mt-1"
                style={{
                  background: 'rgba(34,93,89,0.08)',
                  color: '#225D59',
                  border: '1px solid rgba(34,93,89,0.15)',
                }}
              >
                Let's talk
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
              Mlytics can recommend the right activation scale based on your content inventory,
              audience profile, and brand category opportunities.
            </p>
          </motion.div>
        </div>

        <motion.p
          className="text-xs text-center mt-6"
          style={{ color: '#9B9B9B' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          Revenue is earned only when qualified brand activity occurs within your content environment.
        </motion.p>
      </div>
    </section>
  )
}
