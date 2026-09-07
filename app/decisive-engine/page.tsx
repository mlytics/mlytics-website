import { DecisiveEngineHero } from '@/components/pages/decisive-engine/DecisiveEngineHero'
import { DecisionLoop } from '@/components/pages/decisive-engine/DecisionLoop'
import { OrchestrationDiagram } from '@/components/pages/decisive-engine/OrchestrationDiagram'
import { EngineAdvantages } from '@/components/pages/decisive-engine/EngineAdvantages'
import { EngineComparison } from '@/components/pages/decisive-engine/EngineComparison'
import { EngineUseCases } from '@/components/pages/decisive-engine/EngineUseCases'
import { DecisiveEnginePageCTA } from '@/components/pages/decisive-engine/DecisiveEnginePageCTA'

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
      <DecisionLoop />
      <OrchestrationDiagram />
      <EngineAdvantages />
      <EngineComparison />
      <EngineUseCases />
      <DecisiveEnginePageCTA />
    </>
  )
}
