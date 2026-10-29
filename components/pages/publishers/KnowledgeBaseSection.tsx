'use client'

import { useState, useEffect, useCallback, useId, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

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
  // Keyboard focus inside the card pauses auto-advance like hover does (DESIGN.md §5.7)
  const [focused, setFocused] = useState(false)
  // Reduced motion: no auto-advance, no progress bar (DESIGN.md §8.4)
  const reduce = usePrefersReducedMotion()
  // Switched on mid-way: go back to step 1, like the Hero headline. Only on
  // the false → true change, so later clicks and arrow keys are never undone.
  const prevReduce = useRef(reduce)
  useEffect(() => {
    if (reduce && !prevReduce.current) setActive(0)
    prevReduce.current = reduce
  }, [reduce])

  const baseId = useId()
  const tabId = (i: number) => `${baseId}-tab-${i}`
  const panelId = `${baseId}-panel`
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pendingDotFocus = useRef<number | null>(null)

  // Only focus that arrives by keyboard pauses: a mouse click leaves focus on
  // the clicked step in some browsers, and that must not stop the carousel.
  const keyboardModality = useRef(true)
  useEffect(() => {
    const onKey = () => { keyboardModality.current = true }
    const onPointer = () => { keyboardModality.current = false }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onPointer, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onPointer, true)
    }
  }, [])

  useEffect(() => {
    if (paused || focused || reduce) return
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % STEPS.length)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [paused, focused, reduce, active])

  // Tab pattern keys: arrows move (wrapping), Home / End jump to the ends.
  // Steps from the tab that received the key (`from`), not from `active`: the
  // carousel may have moved on while focus stayed on a clicked tab.
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, from: number) {
    let next: number
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (from + 1) % STEPS.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (from + STEPS.length - 1) % STEPS.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = STEPS.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  // The dots live in the animated panel, which is replaced on every switch:
  // move focus to the matching dot of the new panel once it mounts.
  const registerDot = useCallback((el: HTMLButtonElement | null) => {
    if (el && pendingDotFocus.current === Number(el.dataset.dot)) {
      el.focus()
      pendingDotFocus.current = null
    }
  }, [])
  // Safety net on the panel itself: React attaches a parent's ref after its
  // children's, so this runs once the new panel's dots have had their chance,
  // and a request that matched no dot never lingers into a later switch.
  const clearPendingDotFocus = useCallback((el: HTMLDivElement | null) => {
    if (el) pendingDotFocus.current = null
  }, [])

  return (
    <section className="section-dark py-16 lg:py-20 relative overflow-hidden border-b border-on-dark/12">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 700px 400px at 50% 65%, rgba(34,93,89,0.25) 0%, transparent 70%)',
        }}
      />
      {/* Decorative corner rings */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '38vw', height: '38vw', top: '-12vw', right: '-10vw', border: '1px solid rgba(168,197,195,0.06)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '24vw', height: '24vw', top: '-6vw', right: '-5vw', border: '1px solid rgba(168,197,195,0.06)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: '12vw', height: '12vw', top: '-1vw', right: '0vw', border: '1px solid rgba(168,197,195,0.06)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Eyebrow dark>AI Infrastructure</Eyebrow>
          <h2 className="section-heading text-white mb-4">
            How should a publisher's content be structured for AI retrieval and citation?
          </h2>
          <p className="text-base max-w-xl mx-auto text-on-dark">
            Custom-built from your content. Structured, cross-referenced, and governed by your editorial standards.
          </p>
        </div>

        {/* Unified interactive card */}
        <div
          className="rounded-2xl overflow-hidden border border-primary/40 shadow-lg"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setFocused(keyboardModality.current)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false) }}
        >
          <div className="grid md:grid-cols-[260px_1fr]">
            {/* Left: step list */}
            <div
              role="tablist"
              aria-label="AI infrastructure steps"
              aria-orientation="vertical"
              className="flex flex-col border-r border-on-dark/12 bg-on-dark/6">
              {STEPS.map((step, i) => {
                const isActive = active === i
                return (
                  <button
                    key={i}
                    ref={(el) => { tabRefs.current[i] = el }}
                    type="button"
                    role="tab"
                    id={tabId(i)}
                    aria-selected={isActive}
                    aria-controls={panelId}
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    onClick={() => setActive(i)}
                    className="w-full text-left px-5 py-4 md:py-0 transition-colors duration-200 relative flex flex-col justify-center md:flex-1 focus-visible:-outline-offset-2"
                    style={{
                      borderBottom: i < STEPS.length - 1 ? '1px solid rgba(168,197,195,0.08)' : undefined,
                      background: isActive ? 'rgba(34,93,89,0.55)' : 'transparent',
                    }}
                  >
                    <span
                      className={`block text-xs font-bold tabular-nums mb-1 ${isActive ? 'text-white' : 'text-on-dark'}`}
                      style={{ letterSpacing: '0.05em' }}
                    >
                      0{i + 1}
                    </span>
                    <span className={`block text-sm font-semibold leading-snug ${isActive ? 'text-white' : 'text-on-dark'}`}>
                      {step.label}
                    </span>
                    {isActive && !reduce && (
                      // Spans (not divs) because they sit inside the tab <button>; `block` keeps the layout.
                      <span data-progress className="block mt-2 rounded-full overflow-hidden" style={{ height: 2, background: 'rgba(168,197,195,0.12)' }}>
                        <motion.span
                          key={`bar-${i}`}
                          className="block h-full rounded-full"
                          style={{ background: 'rgba(168,197,195,0.6)' }}
                          initial={{ width: '0%' }}
                          animate={{ width: paused || focused ? undefined : '100%' }}
                          transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                        />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right: content */}
            <div role="tabpanel" id={panelId} aria-labelledby={tabId(active)} className="relative overflow-hidden bg-white">
              {/* Invisible sizer */}
              {STEPS.map((step, si) => (
                <div
                  key={si}
                  className="invisible pointer-events-none p-6 md:p-8 flex flex-col justify-between"
                  aria-hidden="true"
                  style={{ position: si === 0 ? 'relative' : 'absolute', inset: 0 }}
                >
                  <div className="flex flex-col md:overflow-hidden md:h-[170px]">
                    <div className="flex flex-col gap-1 mb-4 md:mb-5">
                      <span>{step.icon}</span>
                      <Eyebrow>{step.sub}</Eyebrow>
                    </div>
                    <p className="text-lg md:text-xl font-bold leading-snug mb-2">{step.label}</p>
                    <p className="text-sm md:text-base leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-6 md:mt-8" style={{ borderTop: '1px solid rgba(168,197,195,0.12)' }}>
                    <div className="flex items-center gap-1">
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
                  ref={clearPendingDotFocus}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between"
                >
                  <div className="flex flex-col md:overflow-hidden md:h-[170px]">
                    <div className="flex flex-col gap-1 mb-4 md:mb-5">
                      <span className="text-primary">{STEPS[active].icon}</span>
                      <Eyebrow>{STEPS[active].sub}</Eyebrow>
                    </div>
                    <p className="text-lg md:text-xl font-bold leading-snug mb-2 text-ink">
                      {STEPS[active].label}
                    </p>
                    <p className="text-sm md:text-base leading-relaxed text-ink-muted">
                      {STEPS[active].desc}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-between pt-4 mt-6 md:mt-8"
                    style={{ borderTop: '1px solid rgba(34,93,89,0.08)' }}
                  >
                    <div className="flex items-center gap-1">
                      {STEPS.map((_, i) => (
                        <button
                          key={i}
                          ref={registerDot}
                          type="button"
                          data-dot={i}
                          aria-label={`Show step ${i + 1}: ${STEPS[i].label}`}
                          aria-current={active === i ? 'true' : undefined}
                          onClick={() => {
                            // Same step: nothing re-mounts, so there is no new dot to focus.
                            if (i !== active) pendingDotFocus.current = i
                            setActive(i)
                          }}
                          className={`rounded-full transition-[width,background-color] duration-300 ${active === i ? 'bg-primary' : 'bg-primary/12'}`}
                          style={{
                            width: active === i ? 18 : 5,
                            height: 5,
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-4xl md:text-5xl font-black tabular-nums select-none" aria-hidden="true"
                      style={{ color: 'rgba(34,93,89,0.12)', letterSpacing: '-0.04em', lineHeight: 1 }}
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
          <span className="text-xs text-on-dark/85">Enterprise infrastructure powered by</span>
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
