'use client'

import { useState } from 'react'

const CLOUD_PARTNERS = [
  { name: 'AWS',             domain: 'aws.amazon.com' },
  { name: 'Google Cloud',    domain: 'cloud.google.com' },
  { name: 'Microsoft Azure', domain: 'microsoft.com' },
  { name: 'Tencent Cloud',   domain: 'tencentcloud.com' },
  { name: 'Alibaba Cloud',   domain: 'alibabacloud.com' },
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
          Infrastructure &amp; Network Partners
        </p>

        {/* Cloud partners */}
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-wider mb-4 text-center" style={{ color: '#C8C8C8' }}>
            Cloud Platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {CLOUD_PARTNERS.map(p => (
              <PartnerLogo key={p.domain} name={p.name} domain={p.domain} />
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
      </div>
    </section>
  )
}
