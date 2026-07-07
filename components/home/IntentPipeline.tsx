'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Globe, Zap, PenLine, MessageSquare, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
    color: 'rgba(168,197,195,0.15)',
    borderColor: 'rgba(168,197,195,0.25)',
  },
  {
    Icon: Zap,
    name: 'Decisive Engine',
    sublabel: 'Route · Observe · Decide',
    audience: 'Developers / Tech',
    desc: 'Every request routed optimally in real time — and every routing decision feeds the intent system.',
    color: 'rgba(34,93,89,0.2)',
    borderColor: 'rgba(34,93,89,0.5)',
  },
  {
    Icon: PenLine,
    name: 'AI Q&A Widget',
    sublabel: 'Capture weak intent',
    audience: 'Media and Content',
    desc: 'AI-generated Q&A at a fraction of human writing cost — every article becomes an intent capture point.',
    color: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  {
    Icon: MessageSquare,
    name: 'Full Conversation',
    sublabel: 'Capture strong intent',
    audience: 'Media and Content + Brands',
    desc: 'Readers move from browsing to decision. Strong intent captured, qualified, and matched to relevant brands.',
    color: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.4)',
  },
  {
    Icon: Target,
    name: 'Lead Pilot',
    sublabel: 'Qualify · Deliver · Convert',
    audience: 'Brands',
    desc: 'Verified strong intent, delivered CRM-ready. Replaces junior SDR workflow at a fraction of the cost.',
    color: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.5)',
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

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!inViewRef.current || hoveringRef.current || userTookOverRef.current) return
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

      {/* Animated particle */}
      <div className="absolute left-[25px] top-0 bottom-0 overflow-hidden pointer-events-none">
        <div
          className="w-1.5 h-1.5 rounded-full absolute bg-gold"
          style={{ animation: 'flow-particle 3s linear infinite', boxShadow: '0 0 6px var(--color-gold)' }}
        />
      </div>

      <div className="space-y-1">
        {LAYERS.map((layer, i) => {
          const isOpen = expanded === i
          return (
            <div key={i}>
              <motion.div
                onClick={() => handleClick(i)}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="relative flex items-start gap-4 pl-14 pr-4 py-3.5 rounded-xl cursor-pointer"
                style={{
                  background: isOpen ? layer.color : 'transparent',
                  border: `1px solid ${isOpen ? layer.borderColor : 'transparent'}`,
                  transition: 'background 0.35s ease-in-out, border-color 0.35s ease-in-out',
                }}
              >
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-primary-dark"
                  style={{ border: `2px solid ${layer.borderColor}` }}
                >
                  <layer.Icon size={15} strokeWidth={1.8} className="text-on-dark" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-semibold text-white">{layer.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-on-dark">
                      {layer.audience}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5 text-on-dark">{layer.sublabel}</p>
                </div>
              </motion.div>

              <motion.div
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
