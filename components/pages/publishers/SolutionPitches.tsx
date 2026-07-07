'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

const PITCHES = [
  {
    num: '01',
    label: 'Intent signals are revenue signals.',
    them: { who: 'Traditional ad model', desc: 'Sell impressions to brands who hope the right person sees the ad. Revenue tied to pageviews, not outcomes.' },
    us: 'Every question your readers ask is an intent signal. Mlytics matches those signals to brand partners who pay per qualified lead.',
    accent: 'var(--color-primary)',
  },
  {
    num: '02',
    label: "AI search takes traffic. We take it back.",
    them: { who: 'AI search engines', desc: 'Extract your content, generate an answer, keep the user. Your analytics show decline. Your revenue drops.' },
    us: 'Your content powers AI answers inside your own domain. Readers stay, brands pay CPL for the intent they generate. You earn from both.',
    accent: 'var(--color-primary)',
  },
  {
    num: '03',
    label: "One integration. Three revenue layers.",
    them: { who: 'Content monetization today', desc: "Banner ads, affiliate links, sponsored posts — each requires a separate deal, separate integration, separate team." },
    us: "One API unlocks AI Q&A Widget revenue, full-conversation CPL, and infrastructure cost savings. Start with one layer, add the next when ready.",
    accent: 'var(--color-primary)',
  },
]

export function SolutionPitches() {
  return (
    <section className="section-white py-16 lg:py-20 border-t border-line">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3">
            The Solution
          </Eyebrow>
          <h2 className="section-heading text-ink">
            Who gets paid when AI uses your content?
          </h2>
        </motion.div>

        {/* Pitch cards */}
        <div className="space-y-3">
          {PITCHES.map((pitch, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(34,93,89,0.14)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(34,93,89,0.08)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              {/* Label bar */}
              <div
                className="px-5 py-3 flex items-center justify-between border-b"
                style={{ background: '#1f4f4b', borderColor: 'rgba(168,197,195,0.08)' }}
              >
                <span className="text-sm font-bold text-white">{pitch.label}</span>
                <span className="text-xs font-bold tabular-nums text-on-dark/60">
                  {pitch.num}
                </span>
              </div>

              {/* Contrast panels */}
              <div className="grid md:grid-cols-[1fr_40px_1fr]">
                {/* Left — Them (muted) */}
                <div className="p-5 flex flex-col gap-2" style={{ background: '#F7F7F7' }}>
                  <Eyebrow color="var(--color-ink-subtle)">
                    {pitch.them.who}
                  </Eyebrow>
                  <p className="text-sm md:text-base leading-relaxed text-ink-muted">
                    {pitch.them.desc}
                  </p>
                </div>

                {/* Arrow divider */}
                <div className="hidden md:flex items-center justify-center border-l border-r bg-surface" style={{ borderColor: '#EEEEEE' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7.5 3L12 7l-4.5 4" stroke={pitch.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Right — Mlytics */}
                <div
                  className="p-5 flex flex-col gap-2 border-t md:border-t-0 md:border-l"
                  style={{ background: 'rgba(34,93,89,0.04)', borderColor: 'rgba(34,93,89,0.12)' }}
                >
                  <Eyebrow color={pitch.accent}>
                    Mlytics
                  </Eyebrow>
                  <p className="text-sm md:text-base leading-relaxed text-ink">
                    {pitch.us}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
