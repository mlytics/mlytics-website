import { PublisherAgentContinuation } from '@/components/pages/publishers/AgentContinuation'
import { ZeroClickSection } from '@/components/pages/publishers/ZeroClickSection'
import { SolutionPitches } from '@/components/pages/publishers/SolutionPitches'
import { KnowledgeBaseSection } from '@/components/pages/publishers/KnowledgeBaseSection'
import { LayerOverview } from '@/components/pages/publishers/LayerOverview'
import { ContentOwnerVerticals } from '@/components/pages/publishers/ContentOwnerVerticals'
import { PublisherPageCTA } from '@/components/pages/publishers/PublisherPageCTA'

export const metadata = { title: 'For Content Owners — Mlytics Decision Engine' }

export default function PublishersPage() {
  return (
    <>
      {/* Hero + Agent continuation — first thing visitors see */}
      <PublisherAgentContinuation />

      {/* Zero-click economy problem */}
      <ZeroClickSection />

      {/* Solution — three pitches vs LLM search */}
      <SolutionPitches />

      {/* Knowledge base engineering */}
      <KnowledgeBaseSection />

      {/* Layer overview */}
      <LayerOverview />

      {/* Proof — verticals + client names */}
      <ContentOwnerVerticals />

      <PublisherPageCTA />
    </>
  )
}
