'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type AgentPersona, HERO_FLOW } from '@/lib/agent-data'
import { AgentDialog } from '@/components/agent/AgentDialog'
import { WorldMapDots } from './WorldMapDots'
import { LogoMarquee } from './LogoMarquee'
import { useContactModal } from '@/context/contact-modal-context'

const MARQUEE_H = 60

const ROTATING_WORDS = [
  'building your brand',
  'growing your audience',
  'driving more revenue',
]

export function HeroSection() {
  const router = useRouter()
  const { open } = useContactModal()
  const spacerRef = useRef<HTMLDivElement>(null)
  const [isFixed, setIsFixed] = useState(true)
  const [wordIdx, setWordIdx] = useState(0)

  function handleComplete(persona: AgentPersona) {
    const routes: Record<NonNullable<AgentPersona>, string> = {
      publisher: '/publishers',
      brand: '/brands',
      developer: '/developers',
    }
    if (persona) router.push(routes[persona])
  }

  // Fixed → natural marquee logic
  useEffect(() => {
    function handleScroll() {
      if (!spacerRef.current) return
      const rect = spacerRef.current.getBoundingClientRect()
      setIsFixed(rect.top > window.innerHeight)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Rotate headline words
  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative min-h-screen section-white flex flex-col">
      {/* Background elements — clipped to section bounds so they don't bleed into adjacent sections */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <WorldMapDots variant="light" />
        {/* Central radial overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(240,248,247,0.97) 0%, rgba(255,255,255,0.65) 65%, transparent 100%)',
          }}
        />
      </div>

      {/* Main content — vertically centred, single column */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-8">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center text-center">

          {/* Live badge */}
          <div className="mb-5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'transparent',
                border: '1px solid rgba(34,93,89,0.18)',
                color: '#225D59',
              }}
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              4.1M WAU · Asia-Pacific
            </div>
          </div>

          {/* Headline — fixed-height second line prevents layout shift */}
          <h1
            className="font-bold leading-tight tracking-tight text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] mb-4 text-center w-full"
            style={{ color: '#1A1A1A' }}
          >
            Your investment<br />
            {/* Fixed-height container — absolute children overlap so height never shifts */}
            <span
              style={{
                display: 'block',
                height: '1.25em',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    color: '#225D59',
                    display: 'block',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ROTATING_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* Subtitle — tighter, more authoritative */}
          <p
            className="text-base md:text-lg font-medium tracking-wide mb-7"
            style={{ color: '#5A5A5A', letterSpacing: '0.01em' }}
          >
            Per dollar, per intelligent outcome.
          </p>

          {/* CTA button */}
          <div className="mb-8">
            <button
              onClick={open}
              className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#225D59' }}
            >
              Book a Demo
            </button>
          </div>

          {/* Agent Dialog */}
          <div className="w-full">
            <AgentDialog flow={HERO_FLOW} onComplete={handleComplete} variant="page" />
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-4">
        <div className="flex flex-col items-center gap-1.5 opacity-50">
          <span className="text-xs" style={{ color: '#225D59' }}>Scroll to explore</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="animate-bounce"
            style={{ color: '#225D59' }}
          >
            <path
              d="M8 3v10M3 9l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Spacer — reserves marquee height */}
      <div ref={spacerRef} style={{ height: MARQUEE_H }} />

      {/* Logo marquee — fixed at viewport bottom until spacer scrolls into view */}
      <div
        style={{ height: MARQUEE_H }}
        className={isFixed ? 'fixed bottom-0 left-0 right-0 z-50' : 'absolute bottom-0 left-0 right-0'}
      >
        <LogoMarquee />
      </div>
    </section>
  )
}
