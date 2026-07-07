'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { trackCTA } from '@/lib/analytics'
import { Eyebrow } from '@/components/ui/Eyebrow'

const grayFilter = (invert = false, brightness = 1, opacity = 0.5) =>
  `${invert ? 'invert(1) ' : ''}grayscale(1) brightness(${brightness}) opacity(${opacity})`


type Logo = { src: string; alt: string; w: number; invert?: boolean; brightness?: number; opacity?: number; hoverInvert?: boolean; hoverSrc?: string }

// colClass: base (mobile 2-col) + lg (6-col) spans
// Layout on lg:
//   Row 1: Finance(3) + Business(3) = 6
//   Row 2: Health(2) + Lifestyle(2) + Automotive(2) = 6
//   Row 3: News(3) + Food(1) + CTA(2) = 6
const VERTICALS: { vertical: string; logos: Logo[]; colClass: string }[] = [
  {
    vertical: 'Finance & Investment',
    colClass: 'col-span-2 lg:col-span-3',
    logos: [
      { src: '/logos/Content Owner/cnyes.svg',        alt: '鉅亨網',        w: 80 },
      { src: '/logos/Content Owner/cmoney.svg',       alt: 'CMoney',        w: 80, invert: true },
      { src: '/logos/Content Owner/gugu.svg',         alt: '股股知識庫',    w: 72, opacity: 0.7 },
    ],
  },
  {
    vertical: 'Business & Management',
    colClass: 'col-span-2 lg:col-span-3',
    logos: [
      { src: '/logos/Content Owner/gvm.svg',          alt: '遠見雜誌',      w: 64 },
      { src: '/logos/Content Owner/managertoday.svg', alt: '經理人',        w: 80 },
      { src: '/logos/Content Owner/bnext.svg',        alt: '數位時代',      w: 72, invert: true, brightness: 0.5, hoverInvert: false },
    ],
  },
  {
    vertical: 'Health & Wellness',
    colClass: 'col-span-1 lg:col-span-2',
    logos: [
      { src: '/logos/Content Owner/edh.svg',          alt: '早安健康',      w: 80 },
    ],
  },
  {
    vertical: 'Lifestyle & Fashion',
    colClass: 'col-span-1 lg:col-span-2',
    logos: [
      { src: '/logos/Content Owner/bella.svg',        alt: 'Bella.tw 儂儂', w: 72 },
    ],
  },
  {
    vertical: 'Automotive',
    colClass: 'col-span-1 lg:col-span-2',
    logos: [
      { src: '/logos/Content Owner/ucar.svg',         alt: 'U-CAR',         w: 72, invert: true },
    ],
  },
  {
    vertical: 'News & Media',
    colClass: 'col-span-2 lg:col-span-3',
    logos: [
      { src: '/logos/Content Owner/udn.svg',          alt: '聯合新聞網',    w: 72, opacity: 0.7 },
      { src: '/logos/Content Owner/nownews.svg',      alt: 'NOWnews',       w: 80, invert: true, hoverInvert: false, hoverSrc: '/logos/Content Owner/nownews_hover.svg' },
      { src: '/logos/Content Owner/ebc.svg',          alt: '東森',          w: 56 },
    ],
  },
  {
    vertical: 'Food & Agriculture',
    colClass: 'col-span-1 lg:col-span-1',
    logos: [
      { src: '/logos/Content Owner/foodnext.svg',     alt: '食力 foodNEXT', w: 88 },
    ],
  },
]

function VerticalCard({ item, i }: { item: typeof VERTICALS[number]; i: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={`${item.colClass} p-5 rounded-2xl border transition-colors duration-200`}
      style={{ borderColor: hovered ? 'var(--color-primary)' : 'var(--color-line)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-4 transition-colors duration-200"
        style={{ color: hovered ? 'var(--color-primary)' : 'var(--color-ink-subtle)' }}
      >
        {item.vertical}
      </p>
      <div className="flex flex-wrap items-center gap-5">
        {item.logos.map(logo => (
          // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={logo.alt}
                    src={hovered && logo.hoverSrc ? logo.hoverSrc : logo.src}
                    alt={logo.alt}
                    style={{
                      height: 28,
                      width: 'auto',
                      objectFit: 'contain',
                      filter: hovered && !logo.hoverSrc
                        ? ((logo.hoverInvert === true || (logo.invert && logo.hoverInvert !== false)) ? 'invert(1)' : 'none')
                        : (!hovered ? grayFilter(logo.invert, logo.brightness, logo.opacity) : 'none'),
                      transition: 'filter 0.25s ease',
                    }}
                  />
        ))}
      </div>
    </div>
  )
}

export function ContentOwnerVerticals() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <Eyebrow className="mb-3">Trusted By</Eyebrow>
          <h2 className="section-heading mb-2 text-ink">
            Which media categories are losing the most revenue to zero-click AI search?
          </h2>
          <p className="text-base leading-relaxed text-ink-muted">
            Find someone like you — already running on Mlytics Cortex.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 grid-flow-dense">
          {VERTICALS.map((item, i) => (
            <VerticalCard key={i} item={item} i={i} />
          ))}

          {/* CTA card — col-span-2 on mobile/tablet, col-span-2 (1/3) on lg */}
          <motion.div
            className="col-span-2 lg:col-span-2"
            whileHover="hover"
            initial="rest"
          >
          <Link
            href="/book-a-demo"
            onClick={() => trackCTA('Get Started', 'content_owners_section')}
            className="p-5 rounded-2xl flex flex-col items-start justify-between w-full h-full text-left relative bg-primary"
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-base font-bold text-white leading-snug">
                Talk to us
              </p>
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                variants={{
                  rest: { x: 0, background: 'rgba(255,255,255,0.15)' },
                  hover: {
                    x: [0, 6, -2, 4, 0],
                    background: 'rgba(255,255,255,0.28)',
                    transition: { x: { duration: 0.5, ease: 'easeOut' }, background: { duration: 0.2 } },
                  },
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7.5 3L12 7l-4.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>
          </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
