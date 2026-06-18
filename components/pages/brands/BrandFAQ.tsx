'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'How do I get my brand cited in AI answers?',
    a: 'The most reliable way is to place your brand inside content that AI systems already read and trust — premium publisher articles, editorial Q&A, and high-intent media. Mlytics Cortex does this through a managed publisher network with 15M+ monthly active users: your brand appears inside AI answers as readers ask questions in your vertical.',
  },
  {
    q: 'Why is my brand invisible in AI search results even though I rank on Google?',
    a: 'Google ranks pages. AI answers cite trusted sources — usually premium publishers, editorial content, and authoritative Q&A. Traditional SEO gets you clicks; it does not automatically get your brand into the AI answer itself. You need to be present in the content AI reads, not just the pages Google indexes.',
  },
  {
    q: 'How can my brand appear in ChatGPT or Gemini responses?',
    a: 'AI platforms source answers from high-trust editorial content. The most effective approach is to have your brand referenced inside those sources — through media partnerships, AI-generated Q&A embedded in publisher articles, and intent-matched product mentions. That is what Media AEO does.',
  },
  {
    q: 'What tools help brands get more exposure in AI search?',
    a: 'There are two categories: monitoring tools that track whether you appear, and execution tools that actively place you. Monitoring tells you the score. Execution changes it. Mlytics Cortex is an execution tool — it engineers your brand into AI answers through a managed publisher network, and charges per qualified lead, not per impression.',
  },
  {
    q: 'What does it mean for a brand to be "cited" by AI, and why does it matter?',
    a: 'When a buyer asks an AI a question and the AI names your brand in the answer — that is a citation. It is the AI-era equivalent of a word-of-mouth recommendation. 60%+ of searches now end without a click, meaning buyers get their answer from AI without ever visiting your site. If your brand is not in that answer, you are invisible at the moment of decision.',
  },
]

export function BrandFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="section-white pt-8 pb-16 lg:pb-20">
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3 text-primary">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight text-ink">
            Common questions.
          </h2>
        </motion.div>

        {/* Accordion */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-base font-semibold leading-snug text-ink">
                  {faq.q}
                </span>
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 bg-primary/8"
                  style={{
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1v8M1 5h8" stroke="#225D59" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="pb-5 text-sm leading-relaxed text-ink-muted">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
