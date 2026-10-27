import { BrandPainSection } from '@/components/pages/brands/BrandPainSection'
import { BrandGEOSection } from '@/components/pages/brands/BrandGEOSection'
import { BrandAEOVsMonitoring } from '@/components/pages/brands/BrandAEOVsMonitoring'
import { BrandFAQ } from '@/components/pages/brands/BrandFAQ'
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
      <div className="section-dark pt-32 pb-12 text-center border-b border-on-dark/12">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="label-eyebrow-pill mb-4 bg-primary/40 text-on-dark"
          >
            For Brands
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 text-balance">
            Get your brand cited in AI answers.
          </h1>
          <p className="text-base max-w-xl mx-auto text-on-dark">
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
          <div className="h-px bg-line" />
        </div>
      </div>
      <BrandFAQ />

      <BrandPageCTA />
    </>
  )
}
