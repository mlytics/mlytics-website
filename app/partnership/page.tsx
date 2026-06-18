import { PartnershipHero } from '@/components/pages/partnership/PartnershipHero'
import { PartnershipHowItWorks } from '@/components/pages/partnership/PartnershipHowItWorks'
import { PartnershipMembership } from '@/components/pages/partnership/PartnershipMembership'
import { PartnershipEarnings } from '@/components/pages/partnership/PartnershipEarnings'
import { PartnershipResponsibilities } from '@/components/pages/partnership/PartnershipResponsibilities'
import { PartnershipCTA } from '@/components/pages/partnership/PartnershipCTA'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Media Partner Program — Turn Digital Assets into AI Monetization',
  description:
    'Join the Mlytics Media Partner Program. Activate your digital asset library, earn revenue share from qualified brand interactions, and build AI monetization infrastructure.',
  openGraph: {
    title: 'Media Partner Program — Turn Digital Assets into AI Monetization | Mlytics Cortex',
    description:
      'Join the Mlytics Media Partner Program. Activate your digital asset library, earn revenue share from qualified brand interactions, and build AI monetization infrastructure.',
    url: 'https://www.mlytics.com/partnership/',
  },
  twitter: {
    title: 'Media Partner Program — Turn Digital Assets into AI Monetization | Mlytics Cortex',
    description:
      'Join the Mlytics Media Partner Program. Activate your digital asset library, earn revenue share from qualified brand interactions, and build AI monetization infrastructure.',
  },
  alternates: { canonical: '/partnership/' },
}

export default function PartnershipPage() {
  return (
    <>
      <PartnershipHero />
      <PartnershipHowItWorks />
      <div className="section-white">
        <div className="max-w-5xl mx-auto px-6">
          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)' }} />
        </div>
      </div>
      <PartnershipResponsibilities />
      <PartnershipEarnings />
      <PartnershipMembership />
      <PartnershipCTA />
    </>
  )
}
