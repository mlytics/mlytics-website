'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { trackCTA } from '@/lib/analytics'
import type { PlaygroundLens } from '@/components/pages/ai-mode-playground/ai-mode-playground-data'

export type PlaygroundCTASectionProps = {
  eyebrow: string
  heading: string
  body: string
  ctaLabel: string
  lens: PlaygroundLens
  trackingPosition: string
  /** How this section is placed on the page — not just a colour.
   *
   *  'standalone' (default) renders its own white `<section>` with the mint
   *  gradient backdrop and dark text, ready to sit between other sections.
   *
   *  'embedded' renders only the inner container — no `<section>`, no
   *  backdrop — with light text, and assumes the host section it is dropped
   *  into is dark (`.section-dark`), inheriting that ground colour and glow.
   *  Placing it inside a light host would put white text on a white ground. */
  variant?: 'standalone' | 'embedded'
}

export function PlaygroundCTASection({
  eyebrow,
  heading,
  body,
  ctaLabel,
  lens,
  trackingPosition,
  variant = 'standalone',
}: PlaygroundCTASectionProps) {
  const isEmbedded = variant === 'embedded'

  const content = (
    <motion.div
      className={
        isEmbedded
          ? 'max-w-5xl mx-auto px-6 relative z-10 pt-12 lg:pt-16 pb-16 lg:pb-28 text-center'
          : 'relative z-10 max-w-3xl mx-auto px-6 text-center'
      }
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
    >
      {/* The eyebrow stays inline with no margin: eyebrow → h2 is "tight"
          (DESIGN.md §3.8), the same gap as every other heading group.
          `block mb-3` here was the "loose" variant; keep it inline. */}
      <Eyebrow dark={isEmbedded}>{eyebrow}</Eyebrow>
      <h2 className={isEmbedded ? 'section-heading text-white mb-4' : 'section-heading mb-4 text-ink'}>
        {heading}
      </h2>
      <p
        className={
          isEmbedded
            ? 'text-base max-w-xl mx-auto mb-8 text-on-dark'
            : 'text-base max-w-xl mx-auto mb-8 text-ink-muted'
        }
      >
        {body}
      </p>
      {/* Matches the primary CTA in DecisiveEnginePageCTA / NotFoundContent —
          dark and light ground share the one button. */}
      <Link
        href={`/ai-mode-playground/?lens=${lens}`}
        onClick={() => trackCTA(ctaLabel, trackingPosition)}
        className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90"
      >
        {ctaLabel}
      </Link>
    </motion.div>
  )

  if (isEmbedded) return content

  return (
    <section className="section-white relative overflow-hidden py-16 lg:py-28">
      {/* Echoes the AI Mode playground hero backdrop so the section previews its destination */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(240,248,247,0.97) 0%, rgba(255,255,255,0.65) 65%, transparent 100%)',
        }}
      />
      {content}
    </section>
  )
}
