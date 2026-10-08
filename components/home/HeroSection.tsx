'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { WorldMapDots } from './WorldMapDots'
import { LogoMarquee } from './LogoMarquee'
import { InlineEmailCTA } from '@/components/ui/InlineEmailCTA'
import { trackCTA } from '@/lib/analytics'

const ROTATING_WORDS = [
  'that puts your brand inside AI answers',
  'that turns AI discovery into revenue',
  'that wins qualified buyers at lower cost',
]

export function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0)

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
          <div className="max-w-[80rem] w-full mx-auto flex flex-col items-center text-center">

            {/* Headline */}
            <h1
              className="max-[420px]:text-[27px] text-4xl md:text-5xl font-bold leading-tight tracking-tight text-balance mb-8 text-center w-full text-ink"
            >
              Discovery and Answer Engine<br />
              <span
                className="flex items-center justify-center relative overflow-hidden max-[420px]:h-[2.6em] md:h-[2.6em]"
                style={{ textAlign: 'center' }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-primary md:absolute md:inset-x-0 md:text-center"
                    style={{ display: 'block' }}
                  >
                    {ROTATING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            {/* Early access CTA + secondary Try AI Mode entry.
                Mobile: stacked, the button exactly as wide as the input block.
                ≥ 640px: one row — the 28rem input block (InlineEmailCTA's own
                max-w-md), 12px gap, then the button. The row needs ~581px
                (448 + 12 + ~121), i.e. a ~629px viewport with px-6; 640 leaves
                a little slack. Not `sm:` — this project redefines sm as 30rem
                (480px, globals.css), where the row would overflow.
                Top-aligned rather than centred: InlineEmailCTA grows an error
                line under its pill, and centring would push the button down
                when that appears. Height 50px = the pill's own height, so the
                two line up exactly. */}
            <div className="flex flex-col gap-3 w-full max-w-md min-[640px]:flex-row min-[640px]:items-start min-[640px]:w-auto min-[640px]:max-w-none">
              <div className="w-full min-[640px]:w-[28rem] min-[640px]:shrink-0">
                <InlineEmailCTA ctaLabel="hero" pageName="Homepage Hero" />
              </div>
              <Link
                href="/ai-mode-playground"
                onClick={() => trackCTA('Try AI Mode', 'home_hero')}
                className="w-full min-[640px]:w-auto min-[640px]:shrink-0 h-[50px] inline-flex items-center justify-center px-[calc(1.25rem-1px)] rounded-full text-sm font-semibold whitespace-nowrap border border-primary bg-white text-primary transition-all hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Try AI Mode
              </Link>
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
