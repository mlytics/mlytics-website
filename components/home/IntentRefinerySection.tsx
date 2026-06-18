'use client'

import { motion } from 'framer-motion'
import { IntentPipeline } from './IntentPipeline'
import { Eyebrow } from '@/components/ui/Eyebrow'

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
            <Eyebrow className="mb-4">
              The Intent Refinery
            </Eyebrow>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-ink">
              How does AI convert content engagement into commercial transactions?
            </h2>
            <p className="text-base leading-relaxed text-ink-muted">
              Through five independently profitable layers, each reader intent signal is refined into a qualified brand lead — from raw traffic to commercial transaction. Enter at the layer that matches your needs.
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
