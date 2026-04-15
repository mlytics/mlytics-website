'use client'

import { useState } from 'react'

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

const CDN_PARTNERS = [
  { name: 'Akamai',          domain: 'akamai.com' },
  { name: 'Cloudflare',      domain: 'cloudflare.com' },
  { name: 'Fastly',          domain: 'fastly.com' },
  { name: 'CDNetworks',      domain: 'cdnetworks.com' },
  { name: 'Limelight',       domain: 'limelight.com' },
  { name: 'Wangsu',          domain: 'wangsu.com' },
  { name: 'Baishan Cloud',   domain: 'baishancloud.com' },
  { name: 'ChinaCache',      domain: 'chinacache.com' },
  { name: '中華電信',         domain: 'cht.com.tw' },
  { name: 'VNCDN',           domain: 'vncdn.vn' },
  { name: 'Tencent Cloud CDN', domain: 'tencent.com' },
]

function PartnerLogo({ name, domain, dark }: { name: string; domain: string; dark?: boolean }) {
  const [failed, setFailed] = useState(false)

  const textStyle = dark
    ? { color: 'rgba(168,197,195,0.7)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' as const }
    : { color: '#9B9B9B', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' as const }

  const imgFilter = dark
    ? 'grayscale(1) invert(1) opacity(0.5)'
    : 'grayscale(1) opacity(0.45)'

  if (failed) {
    return <span style={textStyle}>{name}</span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={name}
      title={name}
      style={{
        height: 22,
        width: 'auto',
        maxWidth: 100,
        objectFit: 'contain',
        filter: imgFilter,
      }}
      onError={() => setFailed(true)}
    />
  )
}

export function InfraPartners() {
  return (
    <section className="section-white py-16 border-t" style={{ borderColor: '#E5E5E5' }}>
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-10" style={{ color: '#9B9B9B' }}>
          Partners &amp; Integrations
        </p>

        {/* Cloud partners */}
        <div className="mb-8">
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
                style={{
                  height: 28,
                  width: 'auto',
                  maxWidth: 140,
                  objectFit: 'contain',
                  filter: 'grayscale(1) brightness(0.18)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-8" style={{ borderColor: '#F0F0F0' }} />

        {/* Model providers */}
        <div className="mb-8">
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
                style={{
                  height: 28,
                  width: 'auto',
                  maxWidth: 140,
                  objectFit: 'contain',
                  filter: 'grayscale(1) brightness(0.18)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-8" style={{ borderColor: '#F0F0F0' }} />

        {/* CDN partners */}
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-4 text-center" style={{ color: '#C8C8C8' }}>
            Integrated CDN Networks — 11 providers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-7">
            {CDN_PARTNERS.map(p => (
              <PartnerLogo key={p.domain} name={p.name} domain={p.domain} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-8" style={{ borderColor: '#F0F0F0' }} />

        {/* Framework compatibility */}
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-4 text-center" style={{ color: '#C8C8C8' }}>
            Framework Compatibility
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              'Vercel AI SDK',
              'OpenAI SDK',
              'LangChain',
              'LlamaIndex',
              'Hugging Face',
              'Anthropic SDK',
            ].map(name => (
              <span
                key={name}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: '#F5F5F5',
                  color: '#6B6B6B',
                  border: '1px solid #E8E8E8',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
