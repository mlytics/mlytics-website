'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const FILTER_DEFAULT = 'grayscale(1) brightness(0.45) opacity(0.9)'
const FILTER_HOVER   = 'grayscale(0) brightness(0.85) opacity(1)'

const BASE = '/logos/Developer%20Partner/svg'

const CLOUD_PARTNERS = [
  { name: 'AWS',             src: `${BASE}/AWS.svg` },
  { name: 'Google Cloud',    src: `${BASE}/Google.svg` },
  { name: 'Microsoft Azure', src: `${BASE}/microsoft.svg` },
  { name: 'Tencent Cloud',   src: `${BASE}/tencent.svg` },
  { name: 'Alibaba Cloud',   src: `${BASE}/alibaba.svg` },
]

const MODEL_PROVIDERS = [
  { name: 'Gemini',    src: `${BASE}/Gemini.svg` },
  { name: 'ByteDance', src: `${BASE}/ByteDance.svg` },
]

// CDN partners — local SVGs where available, name-only fallback otherwise
const CDN_ROW_A = [
  { name: 'Akamai',      src: `${BASE}/akamai.svg` },
  { name: 'Wangsu',      src: `${BASE}/wangsu.svg` },
  { name: 'VNIS',        src: `${BASE}/VNIS.svg` },
  { name: 'eCloud',      src: `${BASE}/ecloud.svg` },
  { name: 'Alliance',    src: `${BASE}/alliance.svg` },
]
const CDN_ROW_B = [
  { name: 'Baishan Cloud',     src: `${BASE}/baishan.svg` },
  { name: 'ChinaCache',        src: `${BASE}/ChinaCache.svg` },
  { name: '中華電信',           src: `${BASE}/chunghwa.svg` },
  { name: 'VNCDN',             src: `${BASE}/vncdn.svg` },
  { name: 'Tencent Cloud CDN', src: `${BASE}/tencent.svg` },
  { name: 'CloudRiches',       src: `${BASE}/cloudriches.svg` },
  { name: 'MasterConcept',     src: `${BASE}/masterconcept.svg` },
]


function HoverLogo({ name, src, height = 28 }: { name: string; src: string | null; height?: number }) {
  const [hovered, setHovered] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#9B9B9B' }}>
        {name}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      title={name}
      style={{
        height,
        width: 'auto',
        objectFit: 'contain',
        filter: hovered ? FILTER_HOVER : FILTER_DEFAULT,
        transition: 'filter 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onError={() => setFailed(true)}
    />
  )
}

function MarqueeRow({ items, reverse = false }: { items: { name: string; src: string | null }[], reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #fff 0%, transparent 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #fff 0%, transparent 100%)' }} />
      <div
        className="flex items-center gap-10 py-2"
        style={{
          animation: `marquee-${reverse ? 'reverse' : 'forward'} 28s linear infinite`,
          width: 'max-content',
        }}
      >
        {doubled.map((p, i) => (
          <HoverLogo key={`${p.name}-${i}`} name={p.name} src={p.src} />
        ))}
      </div>
    </div>
  )
}

export function InfraPartners() {
  return (
    <section className="section-white py-16 border-t" style={{ borderColor: '#E5E5E5' }}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.p
          className="text-center text-xs font-semibold uppercase tracking-widest mb-10"
          style={{ color: '#C8C8C8' }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
        >
          Partners &amp; Integrations
        </motion.p>

        {/* Cloud partners */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-4 text-center" style={{ color: '#C8C8C8' }}>
            Cloud Platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {CLOUD_PARTNERS.map(p => (
              <HoverLogo key={p.name} name={p.name} src={p.src} />
            ))}
          </div>
        </motion.div>

        <div className="border-t my-8" style={{ borderColor: '#E5E5E5' }} />

        {/* Model providers */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-4 text-center" style={{ color: '#C8C8C8' }}>
            AI Model Providers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {MODEL_PROVIDERS.map(p => (
              <HoverLogo key={p.name} name={p.name} src={p.src} />
            ))}
          </div>
        </motion.div>

        <div className="border-t my-8" style={{ borderColor: '#E5E5E5' }} />

        {/* CDN partners — dual alternating marquee */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-5 text-center" style={{ color: '#C8C8C8' }}>
            Integrated CDN Networks — 12 providers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[...CDN_ROW_A, ...CDN_ROW_B].map(p => (
              <HoverLogo key={p.name} name={p.name} src={p.src} />
            ))}
          </div>
        </motion.div>

      </div>

      {/* Keyframe animations for marquee rows */}
      <style>{`
        @keyframes marquee-forward {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
