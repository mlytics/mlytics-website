'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const INTERVAL = 6000

const STEPS = [
  {
    label: 'Content ingestion & structuring',
    sub: 'Content Library → Ingestion',
    desc: 'Your full content library chunked and embedded with editorial context preserved. A finance article is indexed differently from a lifestyle piece — because intent signals are different.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="3" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11" y="10" width="6" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="3" y="13" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    label: 'Cross-referencing & enrichment',
    sub: 'Knowledge Graph',
    desc: "Connections built across your content that don't exist in your CMS — topic clusters, entity relationships. AI draws from multiple relevant sources, not just the nearest match.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="3.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="16.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="3.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="16.5" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="7.5" y1="8.5" x2="5" y2="6" stroke="currentColor" strokeWidth="1.1" />
        <line x1="12.5" y1="8.5" x2="15" y2="6" stroke="currentColor" strokeWidth="1.1" />
        <line x1="7.5" y1="11.5" x2="5" y2="14" stroke="currentColor" strokeWidth="1.1" />
        <line x1="12.5" y1="11.5" x2="15" y2="14" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    ),
  },
  {
    label: 'Quality guardrails',
    sub: 'AI Q&A Widget',
    desc: "Every response grounded in your content. Citation requirements, factual checks, and topic boundaries enforced. The AI stays within your editorial domain — your voice, your standards.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L17 5.5V10C17 13.5 14 16.5 10 18C6 16.5 3 13.5 3 10V5.5L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Security & governance',
    sub: 'Guardrails',
    desc: "Built on Databricks with RBAC, audit logging, and data lineage. Your content stays in your environment. Every query is traceable. PII never exposed.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7.5 9V7C7.5 5.34 8.62 4 10 4C11.38 4 12.5 5.34 12.5 7V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="10" cy="13" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
]

export function KnowledgeBaseSection() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % STEPS.length)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [paused, active])

  return (
    <section className="section-dark py-16 lg:py-20 relative overflow-hidden" style={{ borderBottom: '1px solid rgba(168,197,195,0.12)' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 700px 400px at 50% 65%, rgba(34,93,89,0.2) 0%, transparent 70%)',
        }}
      />
      {/* Decorative corner rings */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '38vw', height: '38vw', top: '-12vw', right: '-10vw', border: '1px solid rgba(168,197,195,0.06)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '24vw', height: '24vw', top: '-6vw', right: '-5vw', border: '1px solid rgba(168,197,195,0.05)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '12vw', height: '12vw', top: '-1vw', right: '0vw', border: '1px solid rgba(168,197,195,0.04)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(168,197,195,0.55)' }}
          >
            AI Infrastructure
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Knowledge Base, Engineered.
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            Custom-built from your content. Structured, cross-referenced, and governed by your editorial standards.
          </p>
        </div>

        {/* Unified interactive card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(34,93,89,0.45)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(34,93,89,0.2)',
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="grid md:grid-cols-[260px_1fr]">
            {/* Left: step list */}
            <div className="flex flex-col" style={{ borderRight: '1px solid rgba(168,197,195,0.12)', background: 'rgba(255,255,255,0.04)' }}>
              {STEPS.map((step, i) => {
                const isActive = active === i
                return (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="w-full text-left px-5 py-4 md:py-0 transition-colors duration-200 relative flex flex-col justify-center md:flex-1"
                    style={{
                      borderBottom: i < STEPS.length - 1 ? '1px solid rgba(168,197,195,0.08)' : undefined,
                      background: isActive ? 'rgba(34,93,89,0.55)' : 'transparent',
                    }}
                  >
                    <span
                      className="block text-[10px] font-bold tabular-nums mb-1"
                      style={{ color: isActive ? 'rgba(168,197,195,0.7)' : 'rgba(168,197,195,0.45)', letterSpacing: '0.05em' }}
                    >
                      0{i + 1}
                    </span>
                    <span className="block text-xs font-semibold leading-snug" style={{ color: isActive ? '#FFFFFF' : 'rgba(168,197,195,0.7)' }}>
                      {step.label}
                    </span>
                    {isActive && (
                      <div className="mt-2.5 rounded-full overflow-hidden" style={{ height: 2, background: 'rgba(168,197,195,0.15)' }}>
                        <motion.div
                          key={`bar-${i}`}
                          className="h-full rounded-full"
                          style={{ background: 'rgba(168,197,195,0.6)' }}
                          initial={{ width: '0%' }}
                          animate={{ width: paused ? undefined : '100%' }}
                          transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                        />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right: content */}
            <div className="relative overflow-hidden" style={{ background: '#FFFFFF' }}>
              {/* Invisible sizer */}
              {STEPS.map((step, si) => (
                <div
                  key={si}
                  className="invisible pointer-events-none p-6 md:p-8 flex flex-col justify-between"
                  aria-hidden="true"
                  style={{ position: si === 0 ? 'relative' : 'absolute', inset: 0 }}
                >
                  <div className="flex flex-col md:overflow-hidden md:h-[170px]">
                    <div className="flex flex-col gap-1.5 mb-4 md:mb-5">
                      <span>{step.icon}</span>
                      <span className="text-xs font-semibold uppercase tracking-widest">{step.sub}</span>
                    </div>
                    <p className="text-lg md:text-xl font-bold leading-snug mb-2">{step.label}</p>
                    <p className="text-sm leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-6 md:mt-8" style={{ borderTop: '1px solid rgba(168,197,195,0.1)' }}>
                    <div className="flex items-center gap-1.5">
                      {STEPS.map((_, i) => <div key={i} style={{ width: 5, height: 5 }} />)}
                    </div>
                    <span className="text-4xl md:text-5xl font-black tabular-nums">01</span>
                  </div>
                </div>
              ))}

              {/* Animated active content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between"
                >
                  <div className="flex flex-col md:overflow-hidden md:h-[170px]">
                    <div className="flex flex-col gap-1.5 mb-4 md:mb-5">
                      <span style={{ color: '#225D59' }}>{STEPS[active].icon}</span>
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A8C5C3' }}>
                        {STEPS[active].sub}
                      </span>
                    </div>
                    <p className="text-lg md:text-xl font-bold leading-snug mb-2" style={{ color: '#1A1A1A' }}>
                      {STEPS[active].label}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
                      {STEPS[active].desc}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-between pt-4 mt-6 md:mt-8"
                    style={{ borderTop: '1px solid rgba(34,93,89,0.08)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      {STEPS.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActive(i)}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: active === i ? 18 : 5,
                            height: 5,
                            background: active === i ? '#225D59' : 'rgba(34,93,89,0.15)',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-4xl md:text-5xl font-black tabular-nums select-none"
                      style={{ color: 'rgba(180,83,9,0.12)', letterSpacing: '-0.04em', lineHeight: 1 }}
                    >
                      0{active + 1}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Databricks credit */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-xs" style={{ color: 'rgba(168,197,195,0.4)' }}>Enterprise infrastructure powered by</span>
          <img
            src="/logos/databricks.svg"
            alt="Databricks"
            style={{ height: 18, width: 'auto', display: 'inline-block', filter: 'brightness(0) invert(1) opacity(0.4)' }}
          />
        </div>
      </div>
    </section>
  )
}
