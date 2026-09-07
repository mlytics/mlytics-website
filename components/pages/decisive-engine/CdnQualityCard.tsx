'use client'

import { Eyebrow } from '@/components/ui/Eyebrow'

const SIGNALS = [
  { name: 'CDN Alpha', score: 88 },
  { name: 'CDN Beta', score: 73 },
  { name: 'CDN Gamma', score: 62 },
]

export function CdnQualityCard() {
  return (
    <aside
      aria-label="Illustrative CDN quality view"
      className="rounded-3xl p-8"
      style={{
        background: 'rgba(34,93,89,0.4)',
        border: '1px solid rgba(168,197,195,0.25)',
      }}
    >
      <Eyebrow dark className="mb-2 block">
        Live decision context
      </Eyebrow>
      <h3 className="text-h3 font-bold text-white mb-6">Regional CDN Quality</h3>

      <div className="grid gap-3 mb-7">
        {SIGNALS.map((signal) => (
          <div
            key={signal.name}
            className="grid grid-cols-[84px_1fr_32px] gap-3 items-center text-xs"
          >
            <span className="text-on-dark">{signal.name}</span>
            <span
              className="h-2 rounded-full overflow-hidden block"
              style={{ background: 'rgba(168,197,195,0.12)' }}
            >
              <span
                className="block h-full rounded-full bg-primary-light"
                style={{ width: `${signal.score}%` }}
              />
            </span>
            <strong className="text-on-dark text-right font-bold">{signal.score}</strong>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center gap-3 px-4 py-4 rounded-2xl bg-white">
        <span className="text-sm font-bold text-primary">Selected route: CDN Alpha</span>
        <span className="label-eyebrow text-primary">Healthy</span>
      </div>
    </aside>
  )
}
