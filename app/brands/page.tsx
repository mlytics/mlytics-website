// import { AgentDialog } from '@/components/agent/AgentDialog'
// import { BRAND_FLOW } from '@/lib/agent-data'
import { BrandComparison } from '@/components/pages/brands/BrandComparison'
import { AudienceSimulator } from '@/components/pages/brands/AudienceSimulator'
import { BrandPageCTA } from '@/components/pages/brands/BrandPageCTA'

export const metadata = { title: 'For Brands — Mlytics Decision Engine' }

export default function BrandsPage() {
  return (
    <>
      {/* Header */}
      <div className="section-dark pt-32 pb-12 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
            For Brands & Advertisers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Don't buy impressions.<br />Buy confirmed intent.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            Only pay for users actively deciding to buy.
          </p>
        </div>
      </div>

      {/* Comparison */}
      <BrandComparison />

      {/* Agent continuation — hidden for now */}
      {/* <section className="section-dark py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">What's your product category?</h2>
            <p className="text-sm mt-1" style={{ color: '#A8C5C3' }}>Let's find your audience in our network.</p>
          </div>
          <AgentDialog flow={BRAND_FLOW} variant="hero" />
        </div>
      </section> */}

      <AudienceSimulator />

      {/* Lead Pilot */}
      <section className="section-dark py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#A8C5C3' }}>Lead Pilot</span>
            <h2 className="text-2xl font-bold text-white mb-3">Intent found. We handle the rest.</h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
              Lead Pilot qualifies, scores, and delivers ready-to-close leads to your sales team — in your CRM format.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', label: 'Strong intent detected', icon: '🎯' },
              { step: '02', label: 'Scored & qualified', icon: '📊' },
              { step: '03', label: 'Delivered to your CRM', icon: '📦' },
              { step: '04', label: 'Pay per result', icon: '💰' },
            ].map(item => (
              <div key={item.step} className="text-center p-4 rounded-xl" style={{ background: 'rgba(34,93,89,0.3)', border: '1px solid rgba(34,93,89,0.4)' }}>
                <span className="text-2xl block mb-2">{item.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#A8C5C3' }}>{item.step}</span>
                <span className="text-xs font-medium text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandPageCTA />
    </>
  )
}
