'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WorldMapDots } from './WorldMapDots'
import { LogoMarquee } from './LogoMarquee'
import { trackCTA } from '@/lib/analytics'

const ROTATING_WORDS = [
  'that puts your brand inside AI answers',
  'that turns AI discovery into revenue',
  'that wins qualified buyers at lower cost',
]

export function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0)

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
              className="font-bold leading-tight tracking-tight text-[28px] sm:text-[40px] md:text-[52px] lg:text-[64px] mb-4 text-center w-full text-ink"
            >
              A Discovery and Answer Engine<br />
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
                    className="text-primary"
                    style={{
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
              Built for businesses ready to monetise the AI era.
            </p>

            {/* Book a Demo CTA */}
            <Link
              href="/book-a-demo"
              onClick={() => trackCTA('Book a Demo', 'hero')}
              className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-primary text-white"
            >
              Book a Demo
            </Link>

          </div>
        </div>

        {/* Logo marquee */}
        <div className="absolute bottom-0 left-0 right-0 h-14 z-10">
          <LogoMarquee isFixed={false} />
        </div>
      </section>
  )
}
