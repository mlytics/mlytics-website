'use client'

import { useRouter } from 'next/navigation'
import { type AgentPersona, HERO_FLOW } from '@/lib/agent-data'
import { AgentDialog } from '@/components/agent/AgentDialog'
import { WorldMapDots } from './WorldMapDots'

export function HeroSection() {
  const router = useRouter()

  function handleComplete(persona: AgentPersona) {
    const routes: Record<NonNullable<AgentPersona>, string> = {
      publisher: '/publishers',
      brand: '/brands',
      developer: '/developers',
    }
    if (persona) router.push(routes[persona])
  }

  return (
    <section className="relative min-h-screen section-dark flex flex-col overflow-hidden">
      {/* Map background */}
      <WorldMapDots />

      {/* Base tone — darkens the whole canvas evenly so dots read as texture, not noise */}
      <div className="absolute inset-0 bg-[#1A3D3A]/60 pointer-events-none" />

      {/* Directional gradient — heavier from the left/top where text lives */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D2422]/80 via-[#1A3D3A]/30 to-transparent pointer-events-none" />

      {/* Radial aura centred on the left column — softens the dot-map immediately behind text */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: 'radial-gradient(ellipse 60% 80% at 22% 50%, rgba(13,36,34,0.72) 0%, transparent 70%)',
        }}
      />

      {/* Bottom fade so the "Scroll to explore" cue reads clearly */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1A3D3A]/90 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: headline + context */}
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(34,93,89,0.4)', border: '1px solid rgba(34,93,89,0.6)', color: '#A8C5C3' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Live intent signals — Asia-Pacific network
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
              style={{ textShadow: '0 2px 24px rgba(13,36,34,0.9), 0 1px 4px rgba(0,0,0,0.5)' }}
            >
              Mlytics<br />
              <span style={{ color: '#A8C5C3' }}>Decision Engine</span>
            </h1>

            <p
              className="text-lg font-medium"
              style={{ color: '#A8C5C3', textShadow: '0 1px 12px rgba(13,36,34,0.8)' }}
            >
              Per dollar, per intelligent outcome.
            </p>

            <p
              className="text-base leading-relaxed max-w-md"
              style={{ color: 'rgba(168,197,195,0.85)', textShadow: '0 1px 8px rgba(13,36,34,0.7)' }}
            >
              Raw attention refined into commercial transactions.
              From 4.1M WAU to qualified leads — every layer self-sustaining.
            </p>

            {/* Metrics strip */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { label: 'Content cost', before: '$250', after: '$0.10', suffix: '/piece' },
                { label: 'Qualified lead', value: '$512', note: '87% confidence' },
                { label: 'Decision latency', value: '< 50ms', note: 'P99' },
              ].map((m, i) => (
                <div
                  key={i}
                  className="px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(34,93,89,0.35)', border: '1px solid rgba(34,93,89,0.55)' }}
                >
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#A8C5C3' }}>{m.label}</p>
                  {m.before ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs line-through" style={{ color: 'rgba(168,197,195,0.4)' }}>{m.before}</span>
                      <span className="text-sm font-bold text-amber-400">{m.after}</span>
                      <span className="text-[10px]" style={{ color: '#A8C5C3' }}>{m.suffix}</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white">{m.value}</span>
                      <span className="text-[10px]" style={{ color: '#A8C5C3' }}>{m.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Agent dialog */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <AgentDialog flow={HERO_FLOW} onComplete={handleComplete} variant="hero" />
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8">
        <div className="flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-xs text-white">Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-bounce text-white">
            <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  )
}
