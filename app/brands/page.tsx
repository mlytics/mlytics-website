import { BrandComparison } from '@/components/pages/brands/BrandComparison'
import { BrandPainSection } from '@/components/pages/brands/BrandPainSection'
import { BrandWhoSection } from '@/components/pages/brands/BrandWhoSection'
import { BrandGEOSection } from '@/components/pages/brands/BrandGEOSection'
import { BrandLeadPilot } from '@/components/pages/brands/BrandLeadPilot'
import { BrandPageCTA } from '@/components/pages/brands/BrandPageCTA'

export const metadata = { title: 'For Brands — Mlytics Decision Engine' }

export default function BrandsPage() {
  return (
    <>
      {/* Hero */}
      <div className="section-dark pt-32 pb-12 text-center" style={{ borderBottom: '1px solid rgba(168,197,195,0.12)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: '#A8C5C3', border: '1px solid rgba(34,93,89,0.6)' }}
          >
            For Brands &amp; Advertisers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Your audience moved to AI.<br />Your ads didn't.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            ROAS is declining. Zero-click is killing your content marketing. Mlytics puts your brand inside AI conversations — across 15M+ MAU.
          </p>
        </div>
      </div>

      {/* Pain */}
      <BrandPainSection />

      {/* Who it's for */}
      {/* <BrandWhoSection /> */}

      {/* GEO — primary sell */}
      <BrandGEOSection />

      {/* Comparison */}
      <BrandComparison />

      {/* Lead Pilot */}
      {/* <BrandLeadPilot /> */}

      <BrandPageCTA />
    </>
  )
}
