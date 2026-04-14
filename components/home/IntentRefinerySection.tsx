import { IntentPipeline } from './IntentPipeline'

export function IntentRefinerySection() {
  return (
    <section className="section-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <div className="lg:sticky lg:top-28">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#225D59' }}>
              The Intent Refinery
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6" style={{ color: '#1A1A1A' }}>
              Your attention is the raw material.<br />
              <span style={{ color: '#225D59' }}>We refine it into commercial transactions.</span>
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: '#6B6B6B' }}>
              A five-layer refinery chain. Each layer independently profitable. Each layer increasing value density for the next.
              Enter at the layer that matches your needs — all layers feed the same engine.
            </p>

            <div className="space-y-3">
              {[
                { metric: '$1,000/mo', desc: 'Infrastructure entry point' },
                { metric: '2,500×', desc: 'Content production efficiency' },
                { metric: '40%', desc: 'Content owner revenue uplift in 30 days' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xl font-bold" style={{ color: '#225D59' }}>{item.metric}</span>
                  <span className="text-sm" style={{ color: '#6B6B6B' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: pipeline */}
          <div className="section-dark rounded-2xl p-6">
            <IntentPipeline />
          </div>
        </div>
      </div>
    </section>
  )
}
