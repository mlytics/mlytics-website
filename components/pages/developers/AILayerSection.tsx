'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const COMPARISONS = [
  {
    num: '01',
    label: 'Request routing',
    before: 'Route request to optimal CDN origin',
    after: 'Same routing — plus intent signal captured',
  },
  {
    num: '02',
    label: 'Performance SLA',
    before: 'Enforce performance SLA < 50ms',
    after: 'Same SLA — plus reader behaviour classified',
  },
  {
    num: '03',
    label: 'Security layer',
    before: 'Apply WAF & security rules',
    after: 'Same security — plus content context indexed',
  },
  {
    num: '04',
    label: 'Event logging',
    before: 'Log delivery event',
    after: 'Same log — now feeds the AI inference layer',
  },
]

export function AILayerSection() {
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
    <section className="section-dark py-16 lg:py-20 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 700px 400px at 50% 50%, rgba(34,93,89,0.18) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,197,195,0.55)' }}>
            AI-Era Infrastructure
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            You already need CDN routing.
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            With Mlytics, every routing decision also feeds an AI intelligence layer — same cost, more value.
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
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(18,40,38,0.88)',
              borderBottom: '1px solid rgba(168,197,195,0.1)',
            } : {}),
          }}
        >
          <div className="px-5 py-4 text-center">
            <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Before
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-base font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>
              With Mlytics
            </p>
          </div>
        </div>

        {/* Data rows */}
        {COMPARISONS.map((item, i) => (
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
                {item.label}
              </span>
            </div>

            {/* Two-column values */}
            <div
              className="grid grid-cols-2 items-center py-5"
              style={{ borderBottom: i < COMPARISONS.length - 1 ? '1px solid rgba(168,197,195,0.08)' : undefined }}
            >
              {/* Before */}
              <div className="px-5 text-center">
                <p className="text-sm leading-relaxed text-white">{item.before}</p>
              </div>

              {/* With Mlytics */}
              <div className="px-5 text-center">
                <p className="text-sm leading-relaxed text-white">{item.after}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Result — large emerging text */}
        <div className="mt-20 text-center relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 60%, rgba(34,93,89,0.45) 0%, transparent 70%)' }}
          />

          <motion.div
            className="mx-auto mb-8"
            style={{ width: 40, height: 1, background: 'rgba(168,197,195,0.3)' }}
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          <motion.p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'rgba(168,197,195,0.5)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Same API contract
          </motion.p>
          <motion.h3
            className="text-4xl md:text-6xl font-bold leading-tight relative text-white"
            initial={{ opacity: 0, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Every request builds
            <span className="block">the intelligence layer.</span>
          </motion.h3>
        </div>
      </div>
    </section>
  )
}
