'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const CLOUD_PARTNERS = [
  { name: 'AWS',             src: '/logos/AWS.svg' },
  { name: 'Google Cloud',    src: '/logos/Google_Cloud.svg' },
  { name: 'Microsoft Azure', src: '/logos/microsoft.svg' },
  { name: 'Tencent Cloud',   src: '/logos/tencent.svg' },
  { name: 'Alibaba Cloud',   src: '/logos/alibaba.svg' },
]

const MODEL_PROVIDERS = [
  { name: 'Gemini',   src: '/logos/gemini.svg' },
  { name: 'Seedance', src: '/logos/seedance.svg' },
  { name: 'Seedream', src: '/logos/seedream.svg' },
]

// Split CDN partners into two rows for alternating marquees
const CDN_ROW_A = [
  { name: 'Akamai',          domain: 'akamai.com' },
  { name: 'Cloudflare',      domain: 'cloudflare.com' },
  { name: 'Fastly',          domain: 'fastly.com' },
  { name: 'CDNetworks',      domain: 'cdnetworks.com' },
  { name: 'Limelight',       domain: 'limelight.com' },
  { name: 'Wangsu',          domain: 'wangsu.com' },
]
const CDN_ROW_B = [
  { name: 'Baishan Cloud',   domain: 'baishancloud.com' },
  { name: 'ChinaCache',      domain: 'chinacache.com' },
  { name: '中華電信',         domain: 'cht.com.tw' },
  { name: 'VNCDN',           domain: 'vncdn.vn' },
  { name: 'Tencent Cloud CDN', domain: 'tencent.com' },
]

const FRAMEWORKS = ['Vercel AI SDK', 'OpenAI SDK', 'LangChain', 'LlamaIndex', 'Hugging Face', 'Anthropic SDK']

function PartnerLogo({ name, domain }: { name: string; domain: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#9B9B9B' }}>
        {name}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={name}
      title={name}
      style={{ height: 20, width: 'auto', maxWidth: 90, objectFit: 'contain', filter: 'grayscale(1) opacity(0.45)' }}
      onError={() => setFailed(true)}
    />
  )
}

function MarqueeRow({ items, reverse = false }: { items: { name: string; domain: string }[], reverse?: boolean }) {
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
          <PartnerLogo key={`${p.domain}-${i}`} name={p.name} domain={p.domain} />
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
          style={{ color: '#9B9B9B' }}
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.name}
                src={p.src}
                alt={p.name}
                title={p.name}
                style={{ height: 28, width: 'auto', maxWidth: 140, objectFit: 'contain', filter: 'grayscale(1) brightness(0.18)' }}
              />
            ))}
          </div>
        </motion.div>

        <div className="border-t my-8" style={{ borderColor: '#F0F0F0' }} />

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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.name}
                src={p.src}
                alt={p.name}
                title={p.name}
                style={{ height: 28, width: 'auto', maxWidth: 140, objectFit: 'contain', filter: 'grayscale(1) brightness(0.18)' }}
              />
            ))}
          </div>
        </motion.div>

        <div className="border-t my-8" style={{ borderColor: '#F0F0F0' }} />

        {/* CDN partners — dual alternating marquee */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-5 text-center" style={{ color: '#C8C8C8' }}>
            Integrated CDN Networks — 11 providers
          </p>
          <div className="space-y-3">
            <MarqueeRow items={CDN_ROW_A} reverse={false} />
            <MarqueeRow items={CDN_ROW_B} reverse={true} />
          </div>
        </motion.div>

        <div className="border-t my-8" style={{ borderColor: '#F0F0F0' }} />

        {/* Framework compatibility */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-4 text-center" style={{ color: '#C8C8C8' }}>
            Framework Compatibility
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {FRAMEWORKS.map(name => (
              <span
                key={name}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#F5F5F5', color: '#6B6B6B', border: '1px solid #E8E8E8' }}
              >
                {name}
              </span>
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
