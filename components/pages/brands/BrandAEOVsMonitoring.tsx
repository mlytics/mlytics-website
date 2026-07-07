'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const ROWS = [
  {
    label: 'What it does',
    monitoring: 'Tracks whether your brand appears in AI answers',
    mlytics: 'Engineers your brand into AI answers',
  },
  {
    label: 'What you get',
    monitoring: 'Visibility reports and dashboards',
    mlytics: 'Actual citations inside AI answers buyers trust',
  },
  {
    label: 'You control',
    monitoring: 'Your measurement',
    mlytics: 'Your placement',
  },
  {
    label: 'Billing',
    monitoring: 'Monthly SaaS subscription',
    mlytics: 'CPL — pay per qualified lead, not per impression',
  },
  {
    label: 'Category',
    monitoring: 'AEO monitoring',
    mlytics: 'AEO execution',
  },
]

export function BrandAEOVsMonitoring() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const mqHandler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', mqHandler)
    return () => mq.removeEventListener('change', mqHandler)
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: '-65px 0px 0px 0px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const showBackdrop = isStuck && !isDesktop

  return (
    <section className="section-white pt-16 lg:pt-20 pb-8">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3">
            Execution vs. Monitoring
          </Eyebrow>
          <h2 className="section-heading text-ink">
            What's the difference between AEO monitoring and AEO execution?
          </h2>
          <p className="text-base max-w-3xl mx-auto mt-4 text-ink-muted">
            AEO monitoring tools tell you your AI search score. Mlytics changes it — by placing your brand inside the AI answers your buyers already trust.
          </p>
        </motion.div>

        {/* Sentinel */}
        <div ref={sentinelRef} />

        {/* Column headers */}
        <div
          className="grid grid-cols-2 mb-3 z-20 transition-colors duration-200"
          style={{
            position: isDesktop ? 'static' : 'sticky',
            top: 64,
            ...(showBackdrop ? {
              background: '#FFFFFF',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            } : {}),
          }}
        >
          <div className="px-5 py-4 text-center">
            <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-subtle)' }}>
              AEO Monitoring
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-subtle)' }}>tracking & reporting tools</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-base font-bold uppercase tracking-widest text-primary">
              Mlytics Cortex
            </p>
            <p className="text-sm mt-1" style={{ color: 'rgba(34,93,89,0.75)' }}>AEO Execution</p>
          </div>
        </div>

        {/* Data rows */}
        {ROWS.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div
              className="px-5 py-3 rounded-lg bg-primary/8"
            >
              <Eyebrow>
                {row.label}
              </Eyebrow>
            </div>

            <div
              className="grid grid-cols-2 items-center py-5"
              style={{ borderBottom: i < ROWS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : undefined }}
            >
              <div className="px-5 text-center">
                <p className="text-sm md:text-base leading-relaxed text-ink-muted">
                  {row.monitoring}
                </p>
              </div>
              <div className="px-5 text-center">
                <p className="text-sm md:text-base leading-relaxed font-medium text-ink">
                  {row.mlytics}
                </p>
              </div>
            </div>
          </motion.div>
        ))}


      </div>
    </section>
  )
}
