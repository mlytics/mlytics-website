// import { AgentDialog } from '@/components/agent/AgentDialog'
// import { DEVELOPER_FLOW } from '@/lib/agent-data'
import { TCOCalculator } from '@/components/pages/developers/TCOCalculator'
import { DeveloperPageCTA } from '@/components/pages/developers/DeveloperPageCTA'

export const metadata = { title: 'For Developers — Mlytics Decision Engine' }

export default function DevelopersPage() {
  return (
    <>
      {/* Header */}
      <div className="section-dark pt-32 pb-12 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,93,89,0.4)', color: '#A8C5C3', border: '1px solid rgba(34,93,89,0.6)' }}>
            For Developers & Technical Buyers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            One API. Smarter<br />content delivery.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#A8C5C3' }}>
            Decisive Engine routes every content delivery decision in &lt;50ms. Replace your CDN contracts. Cut TCO by 20%. Contribute data to the intent flywheel.
          </p>
        </div>
      </div>

      {/* Tech specs overview */}
      <section className="section-white py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { stat: '< 50ms', label: 'P99 decision latency', icon: '⚡' },
              { stat: '20%', label: 'TCO reduction baseline', icon: '📉' },
              { stat: '1 API', label: 'Replaces multiple CDN contracts', icon: '🔌' },
              { stat: 'WAF + DDoS', label: 'Security layer included', icon: '🛡️' },
            ].map(item => (
              <div key={item.label} className="text-center p-5 rounded-2xl border" style={{ borderColor: '#E5E5E5' }}>
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="text-xl font-bold mb-1" style={{ color: '#225D59' }}>{item.stat}</p>
                <p className="text-xs" style={{ color: '#6B6B6B' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent continuation — hidden for now */}
      {/* <section className="section-dark py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">What's your current CDN spend?</h2>
            <p className="text-sm mt-1" style={{ color: '#A8C5C3' }}>Let's calculate your savings in 30 seconds.</p>
          </div>
          <AgentDialog flow={DEVELOPER_FLOW} variant="hero" />
        </div>
      </section> */}

      <TCOCalculator />

      {/* Technical details */}
      <section className="section-dark py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-xl font-bold text-white mb-6 text-center">What Decisive Engine actually does</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Intelligent routing', desc: 'Every content request routed to the optimal origin based on real-time network performance. No manual rules.', icon: '🗺️' },
              { title: 'Data feedback loop', desc: 'Every routing decision feeds the intent classification system. You\'re building the moat by just using infrastructure.', icon: '🔄' },
              { title: 'Unified API', desc: 'One API contract instead of managing Cloudflare, Fastly, Akamai separately. Simpler ops, lower overhead.', icon: '🔌' },
              { title: 'Security layer', desc: 'WAF, DDoS protection, and bot management built in. Not a bolt-on — part of the routing decision itself.', icon: '🛡️' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(34,93,89,0.25)', border: '1px solid rgba(34,93,89,0.4)' }}>
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#A8C5C3' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DeveloperPageCTA />
    </>
  )
}
