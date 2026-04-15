'use client'

import { motion } from 'framer-motion'
import { useContactModal } from '@/context/contact-modal-context'

const DEFAULT_FILTER = 'grayscale(1) brightness(1.5) opacity(0.5)'

const VERTICALS = [
  {
    vertical: 'Finance & Investment',
    logos: [
      { src: '/logos/cnyes.svg', alt: '鉅亨網', w: 80 },
      { src: '/logos/cmoney.png', alt: 'CMoney', w: 80 },
      { src: '/logos/gugu.svg', alt: '股股知識庫', w: 72 },
    ],
  },
  {
    vertical: 'Business & Management',
    logos: [
      { src: '/logos/gvm.png', alt: '遠見雜誌', w: 64 },
      { src: '/logos/managertoday.png', alt: '經理人', w: 80 },
      { src: '/logos/bnext.png', alt: '數位時代', w: 72, filter: 'grayscale(1) brightness(0.8) opacity(0.6)' },
    ],
  },
  {
    vertical: 'Health & Wellness',
    logos: [
      { src: '/logos/edh.png', alt: '早安健康', w: 80 },
    ],
  },
  {
    vertical: 'Lifestyle & Fashion',
    logos: [
      { src: '/logos/bella.png', alt: 'Bella.tw 儂儂', w: 72 },
    ],
  },
  {
    vertical: 'Automotive',
    logos: [
      { src: '/logos/ucar.png', alt: 'U-CAR', w: 72 },
    ],
  },
  {
    vertical: 'News & Media',
    logos: [
      { src: '/logos/udn.jpg', alt: '聯合新聞網', w: 72 },
      { src: '/logos/nownews.svg', alt: 'NOWnews', w: 80, filter: 'grayscale(1) brightness(0.65) opacity(0.6)' },
      { src: '/logos/ebc.png', alt: '東森', w: 56 },
    ],
  },
  {
    vertical: 'Food & Agriculture',
    logos: [
      { src: '/logos/foodnext.png', alt: '食力 foodNEXT', w: 88 },
    ],
  },
]

export function ContentOwnerVerticals() {
  const { open: openContact } = useContactModal()

  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#225D59' }}
          >
            Trusted By
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Content owners across every vertical
          </h2>
          <p className="text-base leading-relaxed" style={{ color: '#6B6B6B' }}>
            Find someone like you — already running on Decision Engine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VERTICALS.map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border"
              style={{ borderColor: '#E5E5E5' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: '#BBBBBB' }}
              >
                {item.vertical}
              </p>
              <div className="flex flex-wrap items-center gap-5">
                {item.logos.map(logo => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={logo.alt}
                    src={logo.src}
                    alt={logo.alt}
                    style={{ height: 28, width: logo.w, objectFit: 'contain', filter: (logo as { filter?: string }).filter ?? DEFAULT_FILTER }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* CTA card */}
          <motion.button
            onClick={openContact}
            className="p-5 rounded-2xl flex flex-col items-start justify-between w-full text-left relative"
            style={{ background: '#225D59', minHeight: 110 }}
            whileHover="hover"
            initial="rest"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,197,195,0.8)' }}>
              Your vertical, next.
            </p>

            <div className="flex items-end justify-between w-full">
              <p className="text-base font-bold text-white leading-snug">
                Talk to us<br />about joining.
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
          </motion.button>
        </div>
      </div>
    </section>
  )
}
