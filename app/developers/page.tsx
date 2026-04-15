import { DeveloperPageCTA } from '@/components/pages/developers/DeveloperPageCTA'
import { InfraPartners } from '@/components/pages/developers/InfraPartners'
import { AILayerSection } from '@/components/pages/developers/AILayerSection'

export const metadata = { title: 'For Developers — Mlytics Decision Engine' }

export default function DevelopersPage() {
  return (
    <>
      {/* Hero */}
      <div className="section-dark pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: '#A8C5C3', border: '1px solid rgba(34,93,89,0.6)' }}
          >
            For Developers & Technical Buyers
          </span>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            One API.
            <span className="block">Content delivery meets multimodal AI.</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            Decisive Engine routes every content delivery decision in &lt;50ms. Replace your CDN contracts. Cut TCO by 20%. Contribute data to the intent flywheel.
          </p>
        </div>
      </div>

      {/* Tech specs */}
      <section className="section-white py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#225D59' }}>
              Performance Specs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#1A1A1A' }}>
              Built for production-grade infrastructure.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { stat: '< 50ms',  label: 'P99 decision latency',          icon: '⚡' },
              { stat: '20%',     label: 'TCO reduction baseline',         icon: '📉' },
              { stat: '99.99%',  label: 'Reliability & SLA guarantee',    icon: '🛡️' },
              { stat: '1 API',   label: 'Replaces multiple CDN contracts', icon: '🔌' },
              { stat: '18+',     label: 'Countries in network',            icon: '🌏' },
            ].map(item => (
              <div key={item.label} className="text-center p-5 rounded-2xl border last:col-span-2 md:last:col-span-1" style={{ borderColor: '#E5E5E5' }}>
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="text-xl font-bold mb-1" style={{ color: '#225D59' }}>{item.stat}</p>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-era reframing */}
      <AILayerSection />

      {/* Infrastructure Partners */}
      <InfraPartners />

      <DeveloperPageCTA />
    </>
  )
}
