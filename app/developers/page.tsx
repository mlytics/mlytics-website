import { DeveloperPageCTA } from '@/components/pages/developers/DeveloperPageCTA'
import { DeveloperSpecs } from '@/components/pages/developers/DeveloperSpecs'
import { InfraPartners } from '@/components/pages/developers/InfraPartners'
import { AILayerSection } from '@/components/pages/developers/AILayerSection'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'One API to Route Your AI Content at Scale',
  description: 'Integrated with leading model providers. One workflow from content generation to global delivery — text, image, voice, and video.',
  openGraph: {
    title: 'One API to Route Your AI Content at Scale | Mlytics Cortex',
    description: 'Integrated with leading model providers. One workflow from content generation to global delivery — text, image, voice, and video.',
    url: 'https://www.mlytics.com/developers/',
  },
  twitter: {
    title: 'One API to Route Your AI Content at Scale | Mlytics Cortex',
    description: 'Integrated with leading model providers. One workflow from content generation to global delivery — text, image, voice, and video.',
  },
  alternates: { canonical: '/developers/' },
}

export default function DevelopersPage() {
  return (
    <>
      {/* Hero */}
      <div className="section-dark pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="label-eyebrow-pill mb-4 bg-primary/40 text-on-dark"
          >
            For Developers
          </span>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            One API.
            <span className="block text-balance">Route your AI Content at Scale.</span>
          </h1>
          <p className="text-base max-w-xl mx-auto text-on-dark">
            Integrated with leading model providers. One workflow from content generation to global delivery — text, image, voice, and video.
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
