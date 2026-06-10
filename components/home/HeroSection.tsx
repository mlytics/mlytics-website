'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type AgentPersona, HERO_FLOW } from '@/lib/agent-data'
import { CORTEX_FLOW_S0 } from '@/lib/cortex-conversation-flow'
import { AgentDialog } from '@/components/agent/AgentDialog'
import { CortexLiveDemo } from '@/components/agent/CortexLiveDemo'
import { WorldMapDots } from './WorldMapDots'
import { LogoMarquee } from './LogoMarquee'
import { trackCTA } from '@/lib/analytics'

const ROTATING_WORDS = [
  'for Brands',
  'for Publishers',
  'for Developers',
]

export function HeroSection() {
  const router = useRouter()
  const [dialogEngaged, setDialogEngaged] = useState(false)
  const [wordIdx, setWordIdx] = useState(0)

  function handleComplete(persona: AgentPersona) {
    const routes: Record<NonNullable<AgentPersona>, string> = {
      publisher: '/content-owners',
      brand: '/brands',
      developer: '/developers',
    }
    if (persona) router.push(routes[persona])
  }

  // Rotate headline words
  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      className="section-white flex flex-col"
      style={{ position: 'relative', height: '100dvh', overflow: 'hidden' }}
    >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <WorldMapDots variant="light" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(240,248,247,0.97) 0%, rgba(255,255,255,0.65) 65%, transparent 100%)',
            }}
          />
        </div>

        {/* Main content — vertically centred, masked top/bottom so chat items fade gracefully */}
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-[96px] pb-14"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 82%, transparent 100%)',
            overflow: 'hidden',
          }}
        >
          <div className="max-w-[52rem] w-full mx-auto flex flex-col items-center text-center">

            {/* Headline */}
            <h1
              className="font-bold leading-tight tracking-tight text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] mb-4 text-center w-full"
              style={{ color: '#1A1A1A' }}
            >
              AI answer monetization<br />
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

            {/* Subtitle */}
            <p
              className="text-sm md:text-base font-normal tracking-wide mb-8 mt-2"
              style={{ color: '#7A7A7A', letterSpacing: '0.04em' }}
            >
              Put your brand inside the AI answers your buyers trust.
            </p>

            {/* Legacy dialogs — hidden, kept for rollback */}
            <div className="hidden" aria-hidden>
              <AgentDialog flow={HERO_FLOW} onComplete={handleComplete} variant="page" bottomPadding={0} />
            </div>
            <div className="hidden" aria-hidden>
              <AgentDialog
                flow={CORTEX_FLOW_S0}
                onComplete={handleComplete}
                variant="page"
                bottomPadding={0}
                onEngage={() => setDialogEngaged(true)}
                onReset={() => setDialogEngaged(false)}
              />
            </div>

            {/* URL input — direct CTA */}
            <div className="w-full">
              <CortexLiveDemo />
            </div>

          </div>
        </div>

        {/* Logo marquee */}
        <div className="absolute bottom-0 left-0 right-0 h-14 z-10">
          <LogoMarquee isFixed={false} />
        </div>
      </section>
  )
}
