'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

type ReferenceLink = { label: string; href: string }

const REFERENCE_LINKS: ReferenceLink[] = [
  { label: 'RUM and Multi-CDN strategy', href: 'https://learning.mlytics.com/web-monitoring/how-to-implement-rum-for-multi-cdn-strategy/' },
  { label: 'Origin Shield, origin load balancing, and synthetic monitoring', href: 'https://www.mlytics.com/blog/mlytics-update-bolstering-origin-shield-and-enhancing-reflex-of-smart-load-balancer-and-pulse/' },
  { label: "Static and dynamic websites — what's the difference?", href: 'https://www.mlytics.com/blog/static-and-dynamic-websites-whats-the-difference/' },
  { label: "Reimagining Chinese games' success in the globe", href: 'https://www.mlytics.com/blog/reimagining-chinese-games-success-in-the-globe/' },
  { label: 'Global gaming data to reduce costs and increase efficiency', href: 'https://www.mlytics.com/blog/global-gaming-data-to-reduce-costs-and-increase-efficiency/' },
  { label: 'Achieving 41% monthly cost savings for e-commerce', href: 'https://www.mlytics.com/blog/achieving-41-monthly-cost-savings-for-e-commerce-with-mlytics-smart-load-balancing/' },
]

const LINKS_INTRO =
  'This page covers the operating model; the resources below go deeper into the mechanics behind it. They explain how RUM pairs with Multi-CDN strategy, how Origin Shield and load balancing reduce origin load, why static and dynamic traffic need different measurement, and what Multi-CDN steering has produced for real gaming and e-commerce workloads. Read them to understand the mechanics in your own time, then bring specific questions to a conversation with sales.'

// Plain-text rendering of the reference links for the FAQPage JSON-LD, since
// schema.org Answer.text must be plain text and cannot carry anchor markup.
// Each link is represented as "Label — URL" so the destination survives in
// the structured data even though the rendered accordion shows real <a> tags.
const LINKS_PLAIN_TEXT = REFERENCE_LINKS.map((link) => `${link.label} — ${link.href}`).join('; ')

type Faq = {
  q: string
  a: string
  links?: ReferenceLink[]
}

const FAQS: Faq[] = [
  {
    q: 'How is this different from contracting with two CDNs ourselves?',
    a: "Contracting with two CDNs on your own usually means fixed traffic-split weights or manual DNS changes, with performance dashboards, DNS, and CDN management sitting in separate tools. Decisive Engine's Observe, Decide, Route loop connects RUM and synthetic monitoring, ISP- and ASN-level measurement, and policy directly to routing, so traffic moves continuously based on measured cross-provider quality rather than a static split. The difference is an operating layer above the contracts, automated and policy-driven, not just having two providers on the books.",
  },
  {
    q: 'How does Mlytics decide which CDN serves a given user, and how quickly does it react?',
    a: 'Decisive Engine runs a continuous Observe, Decide, Route loop. Observe combines real user monitoring and synthetic measurements across countries, regions, ISPs, ASNs, CDN providers, time windows, and content types. Decide evaluates availability, latency, TTFB, download performance, capacity, traffic ratios, cost conditions, and your own policy rules. Route then steers traffic through DNS and Multi-CDN orchestration toward the healthiest path for each market. Because the loop is closed, measurement feeding straight into routing, traffic decisions update continuously rather than on a fixed schedule.',
  },
  {
    q: 'Do we have to replace our current CDN provider?',
    a: 'No. Decisive Engine supports bring-your-own CDN: your existing provider is monitored alongside any others and included in the steering strategy rather than replaced. Where a typical multi-CDN setup means migrating, replacing, or separately integrating each provider, Decisive Engine keeps your current CDN in place and adds an independent decision layer, RUM, synthetic monitoring, and policy, on top, so you gain cross-provider control without renegotiating or switching who serves your traffic today.',
  },
  {
    q: 'Does this only help static assets, or also APIs and dynamic traffic?',
    a: 'Both. Static assets are optimized using download and cache-performance signals, with Origin Shield reducing repeated origin load on cache misses. APIs and dynamic applications are measured end-to-end: latency, timeouts, 5xx errors, and availability all the way to the application endpoint, not just edge or basic HTTP checks. That end-to-end view is what lets Decisive Engine steer real-time traffic such as odds, API, SSE, and WebSocket connections for use cases like sportsbook and iGaming, not only downloadable content.',
  },
  {
    q: 'What happens when one CDN degrades in the middle of a live event?',
    a: 'Availability-first steering uses service health, timeouts, connection failures, and error rates to detect a degrading CDN and move affected traffic onto a healthy delivery path. For live and media-peak scenarios, OTT, VoD, and broadcast events, the same Observe, Decide, Route loop allocates traffic by regional quality, availability, and capacity as conditions change during the event itself, rather than requiring a manual failover once viewers are already affected.',
  },
  {
    q: 'Where can we go deeper before talking to sales?',
    a: `${LINKS_INTRO} ${LINKS_PLAIN_TEXT}`,
    links: REFERENCE_LINKS,
  },
]

export function EngineFAQ() {
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
                    {faq.links ? (
                      <div className="pb-5 text-sm md:text-base leading-relaxed text-ink-muted">
                        <p className="mb-4">{LINKS_INTRO}</p>
                        <ul className="grid gap-3 list-none p-0 m-0">
                          {faq.links.map((link) => (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline-offset-4 hover:underline"
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="pb-5 text-sm md:text-base leading-relaxed text-ink-muted">
                        {faq.a}
                      </p>
                    )}
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
