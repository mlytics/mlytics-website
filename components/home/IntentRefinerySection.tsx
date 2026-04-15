'use client'

import { motion } from 'framer-motion'
import { IntentPipeline } from './IntentPipeline'

export function IntentRefinerySection() {
  return (
    <section className="section-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <motion.div
            className="lg:sticky lg:top-28"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#225D59' }}>
              The Intent Refinery
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ color: '#1A1A1A' }}>
              Your attention is the raw material.<br />
              <span style={{ color: '#225D59' }}>We refine it into commercial transactions.</span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#6B6B6B' }}>
              A five-layer refinery chain. Each layer independently profitable. Each layer increasing value density for the next.
              Enter at the layer that matches your needs — all layers feed the same engine.
            </p>
          </motion.div>

          {/* Right: pipeline */}
          <motion.div
            className="section-dark rounded-2xl p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
          >
            <IntentPipeline />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
