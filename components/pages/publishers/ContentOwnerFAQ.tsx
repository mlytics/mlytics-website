'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

const FAQS = [
  {
    q: 'AI search is pulling readers away from my site. My traffic and revenue keep dropping. What can I do?',
    a: 'Traffic drops because readers stopped clicking — not because they stopped reading. They are still on your articles, generating intent. That intent is monetizable. Most content owners do not have the infrastructure to capture it. Mlytics Cortex does — it captures intent signals as readers browse, matches them to brand partners, and converts them to CPL revenue without sending your readers anywhere.',
  },
  {
    q: 'AI search engines are using my article content to generate answers. Can I get paid for that?',
    a: 'AI search engines extract your content, generate an answer, and keep the user. Your traffic drops. Your ad revenue follows. Mlytics Cortex flips the model — your content powers AI answers inside your own domain. Readers stay, brands pay CPL for the intent they generate, and you earn from both.',
  },
  {
    q: 'My readers show clear purchase intent while browsing articles, but banner ads only count impressions. Is there a way to turn that intent directly into revenue?',
    a: 'Banner ads sell impressions to brands that hope the right person sees them. Reader questions are intent signals, not impressions. Mlytics Cortex matches those signals to brand partners who pay per qualified lead — not per pageview. Your revenue scales with the strength of reader intent, not the volume of page traffic.',
  },
  {
    q: "I don't want to send readers off my platform. Can I still monetize through brand partnerships?",
    a: 'Yes. Every Mlytics Cortex revenue layer operates inside your own domain. The AI Q&A Widget is embedded in your articles. Conversations happen on your properties. Readers are never redirected to Mlytics or any brand page. First-party audience data stays yours.',
  },
  {
    q: 'Can I build an AI knowledge base using my existing article content?',
    a: 'Yes — Mlytics Cortex builds the knowledge base from your existing content library. Articles are chunked and embedded with editorial context preserved, cross-referenced into a knowledge graph, and governed by citation requirements and quality guardrails. Your content never leaves your environment.',
  },
]

export function ContentOwnerFAQ() {
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
          <Eyebrow className="mb-3">
            FAQ
          </Eyebrow>
          <h2 className="section-heading text-ink">
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
                    <path d="M5 1v8M1 5h8" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
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
                    <p className="pb-5 text-sm md:text-base leading-relaxed text-ink-muted">
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
