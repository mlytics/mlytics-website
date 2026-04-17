import { DeveloperPageCTA } from '@/components/pages/developers/DeveloperPageCTA'
import { DeveloperSpecs } from '@/components/pages/developers/DeveloperSpecs'
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
      <DeveloperSpecs />

      {/* AI-era reframing */}
      <AILayerSection />

      {/* Infrastructure Partners */}
      <InfraPartners />

      <DeveloperPageCTA />
    </>
  )
}
