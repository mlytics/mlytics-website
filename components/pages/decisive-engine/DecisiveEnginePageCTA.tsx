'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { EngineFAQ } from '@/components/pages/decisive-engine/EngineFAQ'

const OUTCOMES = [
  'Better regional performance through measured CDN selection',
  'Higher resilience through provider and path diversity',
  'Lower origin pressure through tiered-cache optimization',
  'Clearer operational control through visible routing policy',
]

export function DecisiveEnginePageCTA() {
  return (
    <>
      <section className="section-dark py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-11"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <Eyebrow dark className="mb-3 block">
              The business outcome
            </Eyebrow>
            <h2 className="section-heading text-white">One control layer for global delivery.</h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {OUTCOMES.map((outcome) => (
              <div key={outcome} className="flex gap-3 items-start">
                <span className="grid place-items-center shrink-0 w-6 h-6 rounded-full bg-on-dark text-primary-dark">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="text-base text-on-dark">{outcome}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <EngineFAQ />

      <section className="section-dark py-16 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="section-heading text-white mb-3">
            Which markets are underperforming today?
          </h2>
          <p className="text-base mb-8 text-on-dark">
            Bring your traffic profile — we will map it against measured CDN quality.
          </p>
          <Link
            href="/book-a-demo"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-all hover:opacity-90"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
