import { DecisiveEngineHero } from '@/components/pages/decisive-engine/DecisiveEngineHero'

import type { Metadata } from 'next'

const TITLE = 'Decisive Engine — Route. Observe. Decide.'
const DESCRIPTION =
  'Data-driven Multi-CDN traffic steering powered by real user monitoring, synthetic monitoring, policy control, and origin optimization.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} | Mlytics Cortex`,
    description: DESCRIPTION,
    url: 'https://www.mlytics.com/decisive-engine/',
  },
  twitter: {
    title: `${TITLE} | Mlytics Cortex`,
    description: DESCRIPTION,
  },
  alternates: { canonical: '/decisive-engine/' },
}

export default function DecisiveEnginePage() {
  return (
    <>
      <DecisiveEngineHero />
    </>
  )
}
