'use client'

import { useState, useEffect, useId, useRef } from 'react'
import { motion } from 'framer-motion'
import { Globe, Zap, PenLine, MessageSquare, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const LAYERS: Array<{
  Icon: LucideIcon
  name: string
  sublabel: string
  audience: string
  desc: string
  color: string
  borderColor: string
}> = [
  {
    Icon: Globe,
    name: 'Media and Content Traffic',
    sublabel: 'Raw attention',
    audience: 'Raw material',
    desc: 'Every page view across media platforms is raw intent signal — unrefined, unmonetized, waiting to be captured.',
    color: 'rgba(168,197,195,0.12)',
    borderColor: 'rgba(168,197,195,0.25)',
  },
  {
    Icon: Zap,
    name: 'Decisive Engine',
    sublabel: 'Route · Observe · Decide',
    audience: 'Developers / Tech',
    desc: 'Every request routed optimally in real time — and every routing decision feeds the intent system.',
    color: 'rgba(34,93,89,0.25)',
    borderColor: 'rgba(34,93,89,0.55)',
  },
  {
    Icon: PenLine,
    name: 'AI Q&A Widget',
    sublabel: 'Capture weak intent',
    audience: 'Media and Content',
    desc: 'AI-generated Q&A at a fraction of human writing cost — every article becomes an intent capture point.',
    color: 'rgba(34,93,89,0.4)',
    borderColor: 'rgba(168,197,195,0.25)',
  },
  {
    Icon: MessageSquare,
    name: 'Full Conversation',
    sublabel: 'Capture strong intent',
    audience: 'Media and Content + Brands',
    desc: 'Readers move from browsing to decision. Strong intent captured, qualified, and matched to relevant brands.',
    color: 'rgba(34,93,89,0.55)',
    borderColor: 'rgba(168,197,195,0.4)',
  },
  {
    Icon: Target,
    name: 'Lead Pilot',
    sublabel: 'Qualify · Deliver · Convert',
    audience: 'Brands',
    desc: 'Verified strong intent, delivered CRM-ready. Replaces junior SDR workflow at a fraction of the cost.',
    color: 'rgba(34,93,89,0.7)',
    borderColor: 'rgba(168,197,195,0.55)',
  },
]

const CYCLE_INTERVAL = 3000

export function IntentPipeline() {
  const [expanded, setExpanded] = useState(0)
  // Shared expanded height: descriptions wrap to 2 or 3 lines depending on
  // width; sizing every panel to the tallest keeps the container height
  // constant while the carousel cycles.
  const [descH, setDescH] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const inViewRef = useRef(false)
  const hoveringRef = useRef(false)
  const userTookOverRef = useRef(false)
  const focusedRef = useRef(false)
  const baseId = useId()
  // Reduced motion: no auto-cycling, the first row stays open (DESIGN.md §8.4).
  const reduce = usePrefersReducedMotion()
  const reduceRef = useRef(reduce)
  useEffect(() => {
    // Switched on mid-way: go back to the first row, like the Hero headline.
    // Only on the false → true change, so later clicks are never undone.
    if (reduce && !reduceRef.current) setExpanded(0)
    reduceRef.current = reduce
  }, [reduce])

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!inViewRef.current || hoveringRef.current || userTookOverRef.current || reduceRef.current || focusedRef.current) return
      setExpanded(prev => (prev + 1) % LAYERS.length)
    }, CYCLE_INTERVAL)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting },
      { threshold: 0.1 }
    )
    observer.observe(el)
    startTimer()

    // Pause cycling while the pointer is over the widget (desktop reading)
    const onEnter = () => { hoveringRef.current = true }
    const onLeave = () => { hoveringRef.current = false }
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)

    // Pause the same way while keyboard focus is inside (DESIGN.md §5.7)
    const onFocusIn = () => { focusedRef.current = true }
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node)) focusedRef.current = false
    }
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)

    const measure = () => {
      const ghost = measureRef.current
      if (!ghost) return
      let max = 0
      for (const child of Array.from(ghost.children)) {
        max = Math.max(max, (child as HTMLElement).offsetHeight)
      }
      setDescH(max)
    }
    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function handleClick(i: number) {
    setExpanded(i)
    // The reader takes over: stop auto-cycling for good
    userTookOverRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
  }

  return (
    <div ref={containerRef} className="relative max-w-lg mx-auto">
      {/* Hidden measurer: the tallest description defines the shared expanded height */}
      <div ref={measureRef} aria-hidden className="absolute inset-x-0 top-0 invisible pointer-events-none">
        {LAYERS.map((layer, i) => (
          <div key={i} className="pl-14 pr-4">
            <p className="text-sm py-2 leading-relaxed">{layer.desc}</p>
          </div>
        ))}
      </div>

      {/* Vertical flow line */}
      <div
        className="absolute left-[28px] top-8 bottom-8 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-primary) 10%, var(--color-gold) 90%, transparent)' }}
      />

      {/* Animated particle — full-height wrapper animates translateY so the keyframe's 100% spans the container */}
      <div className="absolute left-[25px] top-0 bottom-0 overflow-hidden pointer-events-none">
        <div className="h-full" style={{ animation: 'flow-particle 3s linear infinite' }}>
          <div
            className="w-1.5 h-1.5 rounded-full bg-gold"
            style={{ boxShadow: '0 0 6px rgba(168,197,195,0.6)' }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {LAYERS.map((layer, i) => {
          const isOpen = expanded === i
          return (
            <div key={i}>
              {/* A real button (DESIGN.md §3.6). w-full text-left undo the button's
                  shrink-to-fit width and centred text; inside it only phrasing
                  elements are allowed, so the former div/p are spans. */}
              <motion.button
                type="button"
                onClick={() => handleClick(i)}
                aria-expanded={isOpen}
                aria-controls={`${baseId}-desc-${i}`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="w-full text-left relative flex items-start gap-4 pl-14 pr-4 py-3 rounded-xl cursor-pointer"
                style={{
                  background: isOpen ? layer.color : 'transparent',
                  border: `1px solid ${isOpen ? layer.borderColor : 'transparent'}`,
                  transition: 'background 0.35s ease-in-out, border-color 0.35s ease-in-out',
                }}
              >
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-primary-dark"
                  style={{ border: `1px solid ${layer.borderColor}` }}
                >
                  <layer.Icon size={15} strokeWidth={1.8} className="text-on-dark" />
                </span>

                <span className="block flex-1 min-w-0">
                  <span className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-semibold text-white">{layer.name}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-on-dark/8 text-on-dark">
                      {layer.audience}
                    </span>
                  </span>
                  <span className="block text-sm text-on-dark">{layer.sublabel}</span>
                </span>
              </motion.button>

              <motion.div
                id={`${baseId}-desc-${i}`}
                aria-hidden={!isOpen}
                className="pl-14 pr-4 overflow-hidden"
                initial={false}
                animate={{
                  height: isOpen ? (descH ?? 'auto') : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <p className="text-sm py-2 leading-relaxed" style={{ color: 'rgba(168,197,195,0.85)' }}>
                  {layer.desc}
                </p>
              </motion.div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
