'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const OUTCOMES = [
  'Better regional performance through measured CDN selection',
  'Higher resilience through provider and path diversity',
  'Lower origin pressure through tiered-cache optimization',
  'Clearer operational control through visible routing policy',
]

type Reference = { label: string; href: string }

const REFERENCES: Reference[] = [
  { label: 'RUM and Multi-CDN strategy', href: 'https://learning.mlytics.com/web-monitoring/how-to-implement-rum-for-multi-cdn-strategy/' },
  { label: 'Origin Shield, origin load balancing, and synthetic monitoring', href: 'https://www.mlytics.com/blog/mlytics-update-bolstering-origin-shield-and-enhancing-reflex-of-smart-load-balancer-and-pulse/' },
  { label: "Static and dynamic websites — what's the difference?", href: 'https://www.mlytics.com/blog/static-and-dynamic-websites-whats-the-difference/' },
  { label: "Reimagining Chinese games' success in the globe", href: 'https://www.mlytics.com/blog/reimagining-chinese-games-success-in-the-globe/' },
  { label: 'Global gaming data to reduce costs and increase efficiency', href: 'https://www.mlytics.com/blog/global-gaming-data-to-reduce-costs-and-increase-efficiency/' },
  { label: 'Achieving 41% monthly cost savings for e-commerce', href: 'https://www.mlytics.com/blog/achieving-41-monthly-cost-savings-for-e-commerce-with-mlytics-smart-load-balancing/' },
]

export function DecisiveEnginePageCTA() {
  return (
    <>
      <section className="section-dark py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="text-center max-w-3xl mx-auto"
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
            className="grid gap-4"
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

      <section className="section-white py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center max-w-3xl mx-auto mb-8">
              <Eyebrow className="mb-3 block">Official references</Eyebrow>
              <h2 className="section-heading text-ink">
                Explore the underlying capabilities.
              </h2>
            </div>
            <ul className="grid gap-3 list-none p-0 m-0">
              {REFERENCES.map((ref) => (
                <li key={ref.href}>
                  <a
                    href={ref.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

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
