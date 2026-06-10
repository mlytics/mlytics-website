'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ─── Scroll-driven conversation ──────────────────────────────────────────────
// Accepts scrollYProgress (0→1) from the parent HeroSection scroll zone.
// Bubbles appear one-by-one as scroll advances.

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={{ background: 'rgba(34,93,89,0.07)', color: '#1A1A1A' }}
      >
        {children}
      </div>
    </motion.div>
  )
}

function TypewriterAgentBubble({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let i = 0
    const startId = setTimeout(() => {
      const id = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) clearInterval(id)
      }, 18)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(startId)
  }, [text, delay])

  const done = displayed.length >= text.length

  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={{ background: 'rgba(34,93,89,0.07)', color: '#1A1A1A' }}
      >
        {displayed}
        {!done && (
          <span
            style={{ display: 'inline-block', width: 2, height: '0.9em', background: '#225D59', marginLeft: 1, verticalAlign: 'text-bottom', borderRadius: 1 }}
            className="animate-pulse"
          />
        )}
      </div>
    </motion.div>
  )
}

// AI Recommendation Share card — shows category-level concentration to create FOMO
function InsightCard() {
  const textSecondary = '#6B6B6B'
  const bars = [
    { label: 'Brand #1', pct: 52, color: '#225D59' },
    { label: 'Brand #2', pct: 27, color: '#3a8a84' },
    { label: 'Brand #3', pct: 12, color: '#7bbdb9' },
    { label: 'Everyone else', pct: 9, color: '#E0E0E0' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden w-full"
      style={{ border: '1px solid #E5E5E5', background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      <div className="px-4 pt-4 pb-3">
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#225D59', marginBottom: 4 }}>
          AI Recommendation Share
        </p>
        <p style={{ fontSize: 11, color: textSecondary, marginBottom: 16 }}>
          Typical category · Asia-Pacific · this week
        </p>
        <div className="flex flex-col gap-3">
          {bars.map((b, i) => (
            <div key={b.label} className="flex items-center gap-2.5">
              <p style={{ fontSize: 11, color: i === bars.length - 1 ? textSecondary : '#1A1A1A', width: 100, flexShrink: 0 }}>{b.label}</p>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#F0F0F0', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: b.color, borderRadius: 99 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: b.color === '#E0E0E0' ? textSecondary : b.color, width: 28, textAlign: 'right', flexShrink: 0 }}>{b.pct}%</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: '#F0F0F0' }} />
      <div className="px-4 py-3 flex items-center gap-2">
        <span style={{ fontSize: 20, fontWeight: 800, color: '#225D59', letterSpacing: '-0.03em' }}>91%</span>
        <span style={{ fontSize: 11, color: textSecondary, lineHeight: 1.4 }}>of AI-driven buyer attention captured<br />by just 3 brands in a typical category</span>
      </div>
    </motion.div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

type Step =
  | { type: 'agent'; content: React.ReactNode }
  | { type: 'typewriter'; text: string; delay?: number }
  | { type: 'urlinput' }

const STEPS: Step[] = [
  { type: 'typewriter', text: '15M+ readers ask AI for product recommendations every month.' },
  { type: 'typewriter', text: "Just give us one URL. We'll show you how visible your brand is inside AI answers." },
  { type: 'urlinput' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

interface CortexLiveDemoProps {
  scrollYProgress: MotionValue<number>
}

function UrlInputStep() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 700)
    return () => clearTimeout(id)
  }, [])

  function handleSubmit() {
    const domain = value.trim()
    if (!domain) return
    router.push(`/book-a-demo?url=${encodeURIComponent(domain)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-start w-full"
    >
      <div className="max-w-[85%] w-full" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {!ready ? (
            // Skeleton
            <motion.div
              key="skeleton"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 items-center"
              style={{ padding: '10px 10px 10px 14px', background: 'white', border: '1px solid #E5E5E5', borderRadius: 16 }}
            >
              <div className="flex-1 h-4 rounded-full animate-pulse" style={{ background: '#E8E8E8' }} />
              <div className="h-8 w-28 rounded-xl animate-pulse flex-shrink-0" style={{ background: '#D4E6E5' }} />
            </motion.div>
          ) : (
            // Real input
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex gap-2 items-center"
              style={{
                background: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: 16,
                padding: '10px 10px 10px 14px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
              }}
            >
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="yourbrand.com"
                autoComplete="off"
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#1A1A1A', minWidth: 0 }}
              />
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#225D59', color: 'white' }}
              >
                Analyze my brand
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function CortexLiveDemo({ scrollYProgress }: CortexLiveDemoProps) {
  const [visibleCount, setVisibleCount] = useState(1)

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    const next = Math.max(1, Math.min(Math.ceil(progress * STEPS.length) + 1, STEPS.length))
    setVisibleCount(next)
  })

  return (
    <div className="w-full text-left">
      <div className="flex flex-col gap-3 pt-2 pb-4">
        <AnimatePresence>
          {STEPS.slice(0, visibleCount).map((step, i) => {
            if (step.type === 'typewriter') return <TypewriterAgentBubble key={i} text={step.text} delay={step.delay} />
            if (step.type === 'agent') return <AgentBubble key={i}>{step.content}</AgentBubble>
            if (step.type === 'urlinput') return <UrlInputStep key={i} />
            return null
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
