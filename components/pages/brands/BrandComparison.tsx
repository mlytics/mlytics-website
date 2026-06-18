'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const ROWS = [
  { label: 'Targeting',     cpm: 'Hope-based audience segments',      mlytics: 'Real-time intent — readers actively researching your category' },
  { label: 'User intent',   cpm: 'Unknown — you pay and hope',        mlytics: 'Verified — captured at the moment of reading' },
  { label: 'What you get',  cpm: 'Eyeballs that may or may not care', mlytics: 'Buyers mid-research, inside content they already trust' },
  { label: 'ROI model',     cpm: 'Spend first, measure later',        mlytics: 'Outcome-based — pay per qualified lead, not per impression' },
  { label: 'Discovery',     cpm: 'You run SEO / open-web AEO yourself', mlytics: 'Media AEO places your brand in AI answers across 15M+ MAU' },
]

export function BrandComparison() {
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
    <section className="section-white py-16 lg:py-20">
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
            The Difference
          </Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-ink">
            How does intent-based buying compare to traditional CPM advertising?
          </h2>
        </motion.div>

        {/* Sentinel — marks where sticky kicks in */}
        <div ref={sentinelRef} />

        {/* Column headers */}
        <div
          className="grid grid-cols-2 mb-3 z-20 lg:static transition-colors duration-200"
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
            <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'rgba(26,26,26,0.35)' }}>
              Traditional CPM
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-base font-bold uppercase tracking-widest text-primary">
              Mlytics Cortex
            </p>
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
            {/* Category label */}
            <div
              className="px-5 py-3 rounded-lg bg-primary/8"
            >
              <Eyebrow>
                {row.label}
              </Eyebrow>
            </div>

            {/* Two-column values */}
            <div
              className="grid grid-cols-2 items-center py-5"
              style={{ borderBottom: i < ROWS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : undefined }}
            >
              <div className="px-5 text-center">
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(26,26,26,0.45)' }}>
                  {row.cpm}
                </p>
              </div>
              <div className="px-5 text-center">
                <p className="text-sm leading-relaxed font-medium text-ink">
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
