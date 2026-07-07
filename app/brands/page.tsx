import { BrandComparison } from '@/components/pages/brands/BrandComparison'
import { BrandPainSection } from '@/components/pages/brands/BrandPainSection'
import { BrandWhoSection } from '@/components/pages/brands/BrandWhoSection'
import { BrandGEOSection } from '@/components/pages/brands/BrandGEOSection'
import { BrandAEOVsMonitoring } from '@/components/pages/brands/BrandAEOVsMonitoring'
import { BrandFAQ } from '@/components/pages/brands/BrandFAQ'
import { BrandLeadPilot } from '@/components/pages/brands/BrandLeadPilot'
import { BrandPageCTA } from '@/components/pages/brands/BrandPageCTA'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Your Brand Cited in AI Answers — Media AEO',
  description: 'Mlytics Cortex places your brand inside the AI answers your buyers already trust — across a managed publisher network with 15M+ monthly active users.',
  openGraph: {
    title: 'Get Your Brand Cited in AI Answers — Media AEO | Mlytics Cortex',
    description: 'Mlytics Cortex places your brand inside the AI answers your buyers already trust — across a managed publisher network with 15M+ monthly active users.',
    url: 'https://www.mlytics.com/brands/',
  },
  twitter: {
    title: 'Get Your Brand Cited in AI Answers — Media AEO | Mlytics Cortex',
    description: 'Mlytics Cortex places your brand inside the AI answers your buyers already trust — across a managed publisher network with 15M+ monthly active users.',
  },
  alternates: { canonical: '/brands/' },
}

export default function BrandsPage() {
  return (
    <>
      {/* Hero */}
      <div className="section-dark pt-32 pb-12 text-center" style={{ borderBottom: '1px solid rgba(168,197,195,0.12)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: 'var(--color-on-dark)', border: '1px solid rgba(34,93,89,0.6)' }}
          >
            For Brands
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Get your brand cited<br />in AI answers.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--color-on-dark)' }}>
            Mlytics Cortex places your brand inside the AI answers your buyers already trust — across a managed publisher network with 15M+ monthly active users.
          </p>
        </div>
      </div>

      {/* Pain */}
      <BrandPainSection />

      {/* Media AEO — network + workflow */}
      <BrandGEOSection />

      {/* AEO Execution vs Monitoring + FAQ — same visual block */}
      <BrandAEOVsMonitoring />
      <div className="section-white">
        <div className="max-w-5xl mx-auto px-6">
          <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
        </div>
      </div>
      <BrandFAQ />

      {/* Who it's for */}
      {/* <BrandWhoSection /> */}

      {/* Lead Pilot */}
      {/* <BrandLeadPilot /> */}

      <BrandPageCTA />
    </>
  )
}
