'use client'

import { motion } from 'framer-motion'

const PITCHES = [
  {
    num: '01',
    label: 'Own the relationship.',
    them: { who: 'LLM search engines', desc: 'Summarize your content, answer the user, and keep them. Your readers never arrive.' },
    us: 'Deploy AI experiences on your site. Readers stay, engage longer, and generate intent signals you monetize.',
    accent: '#225D59',
  },
  {
    num: '02',
    label: "We add traffic. We don't steal it.",
    them: { who: 'AI-powered search', desc: 'Extracts your content, generates an answer, keeps the user. Your analytics show decline.' },
    us: 'Brings AI experiences to your domain. More engagement, not less. Your content, your audience, your data.',
    accent: '#225D59',
  },
  {
    num: '03',
    label: "Reach demographics your site can't.",
    them: { who: 'Traditional SEO & social', desc: "Under-35 cohorts live in AI chat and agent-curated feeds — unreachable by current strategy." },
    us: "Distributes your content into AI-powered surfaces. New demographics, without changing your editorial workflow.",
    accent: '#225D59',
  },
]

export function SolutionPitches() {
  return (
    <section className="section-white py-16 lg:py-20" style={{ borderTop: '1px solid #E5E5E5' }}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#225D59' }}
          >
            The Solution
          </span>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#1A1A1A' }}>
            We&apos;re built to be the opposite.
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
                style={{ background: '#FFFFFF', borderColor: '#EEEEEE' }}
              >
                <span className="text-sm font-bold" style={{ color: '#225D59' }}>{pitch.label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: pitch.accent, opacity: 0.7 }}>
                  {pitch.num}
                </span>
              </div>

              {/* Contrast panels */}
              <div className="grid md:grid-cols-[1fr_40px_1fr]">
                {/* Left — Them (muted) */}
                <div className="p-5 flex flex-col gap-2" style={{ background: '#F7F7F7' }}>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#CCCCCC' }}>
                    {pitch.them.who}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#BBBBBB' }}>
                    {pitch.them.desc}
                  </p>
                </div>

                {/* Arrow divider */}
                <div className="hidden md:flex items-center justify-center border-l border-r" style={{ background: '#FAFAFA', borderColor: '#EEEEEE' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7.5 3L12 7l-4.5 4" stroke={pitch.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Right — Mlytics */}
                <div
                  className="p-5 flex flex-col gap-2 border-l"
                  style={{ background: 'rgba(34,93,89,0.04)', borderColor: 'rgba(34,93,89,0.12)' }}
                >
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: pitch.accent }}>
                    Mlytics
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>
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
