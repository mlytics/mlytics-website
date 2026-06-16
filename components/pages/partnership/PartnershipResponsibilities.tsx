'use client'

import { motion } from 'framer-motion'

const MLYTICS_HANDLES = [
  'AI experience platform and infrastructure',
  'Answer page generation and optimization',
  'Brand Knowledge Base and content management',
  'JSON-LD, sitemap, and hosting support',
  'Campaign delivery and brand coordination',
  'Reporting dashboard and revenue tracking',
  'Customer success and technical support',
]

const YOU_BRING = [
  'Your content library',
  'Your publishing environment',
  'Your audience',
  'Your brand relationships, if available',
]

export function PartnershipResponsibilities() {
  return (
    <section className="section-white pt-10 pb-16 lg:pb-20">
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
            What Mlytics handles
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#1A1A1A' }}>
            So you do not have to.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {/* Mlytics handles */}
          <motion.div
            className="rounded-2xl p-8"
            style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#225D59' }}>
              What Mlytics handles
            </p>
            <ul className="space-y-3">
              {MLYTICS_HANDLES.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: '#1A1A1A' }}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                >
                  <span
                    className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,93,89,0.1)' }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="#225D59" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* You bring */}
          <motion.div
            className="rounded-2xl p-8"
            style={{ background: 'rgba(34,93,89,0.03)', border: '1px solid rgba(34,93,89,0.1)' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#9B9B9B' }}>
              What you bring
            </p>
            <ul className="space-y-3">
              {YOU_BRING.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: '#1A1A1A' }}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.25 + i * 0.06 }}
                >
                  <span
                    className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,93,89,0.1)' }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="#225D59" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
