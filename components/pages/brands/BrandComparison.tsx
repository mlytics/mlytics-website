'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const ROWS = [
  { label: 'Billing',       cpm: 'Per 1,000 impressions',             mlytics: 'Per qualified intent signal' },
  { label: 'User intent',   cpm: 'Unknown — hope-based targeting',    mlytics: 'Verified — real-time intent classification' },
  { label: 'What you get',  cpm: 'Eyeballs that may or may not care', mlytics: 'Readers actively researching your category' },
  { label: 'ROI model',     cpm: 'Spend first, measure later',        mlytics: 'Outcome-based — pay for verified engagement' },
  { label: 'Discovery',     cpm: 'You run SEO / GEO yourself',        mlytics: 'Mlytics GEO places your brand across 15M+ MAU network' },
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
    <section className="section-dark py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,197,195,0.55)' }}>
            The Difference
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Traditional CPM vs. Decision Engine
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
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(18,40,38,0.88)',
              borderBottom: '1px solid rgba(168,197,195,0.1)',
            } : {}),
          }}
        >
          <div className="px-5 py-4 text-center">
            <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Traditional CPM
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Decision Engine
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
              className="px-5 py-3 rounded-lg"
              style={{ background: 'rgba(34,93,89,0.25)' }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(168,197,195,0.6)' }}>
                {row.label}
              </span>
            </div>

            {/* Two-column values */}
            <div
              className="grid grid-cols-2 items-center py-5"
              style={{ borderBottom: i < ROWS.length - 1 ? '1px solid rgba(168,197,195,0.08)' : undefined }}
            >
              <div className="px-5 text-center">
                <p className="text-sm leading-relaxed text-white">
                  {row.cpm}
                </p>
              </div>
              <div className="px-5 text-center">
                <p className="text-sm leading-relaxed text-white">
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
