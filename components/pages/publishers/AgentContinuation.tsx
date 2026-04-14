'use client'

// import { AgentDialog } from '@/components/agent/AgentDialog'
// import { PUBLISHER_FLOW } from '@/lib/agent-data'

export function PublisherAgentContinuation() {
  return (
    <div className="section-dark pt-32 pb-12 text-center">
      <div className="max-w-3xl mx-auto px-6">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(34,93,89,0.4)', color: '#A8C5C3', border: '1px solid rgba(34,93,89,0.6)' }}
        >
          For Content Owners & Media Platforms
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Every layer earns.
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
          Not just cost savings — three independent revenue and savings layers,
          all from one integration.
        </p>

        {/* Agent dialog — hidden for now */}
        {/* <div className="mt-10 max-w-xl mx-auto text-left">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,197,195,0.5)' }}>
            Continuing from your demo
          </p>
          <AgentDialog flow={PUBLISHER_FLOW} variant="hero" />
        </div> */}
      </div>
    </div>
  )
}
