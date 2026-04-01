import { FlywheelDiagram } from './FlywheelDiagram'

export function FlywheelSection() {
  return (
    <section className="section-dark py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: flywheel */}
          <div>
            <FlywheelDiagram />
          </div>

          {/* Right: copy */}
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#A8C5C3' }}>
              The Flywheel
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6" style={{ color: '#FAFAFA' }}>
              The longer it spins,<br />
              <span style={{ color: '#F59E0B' }}>the harder it is to stop.</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: '#A8C5C3' }}>
              More publishers → more intent data → smarter decisions → higher CPL for brands → higher publisher revenue → more publishers join. Each rotation compounds.
            </p>

            <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(34,93,89,0.3)', border: '1px solid rgba(34,93,89,0.5)' }}>
              <p className="text-sm font-medium text-white mb-1">4M Weekly Active Users</p>
              <p className="text-sm" style={{ color: '#A8C5C3' }}>Not the destination — proof the flywheel is already spinning.</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(168,197,195,0.6)' }}>
                We reached 2M WAU in 6 months with zero marketing spend. That's PMF signal, not a marketing result.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Brand value', icon: '💡' },
                { label: 'User growth', icon: '📈' },
                { label: 'Revenue growth', icon: '💰' },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-xl text-center"
                  style={{ background: 'rgba(34,93,89,0.3)', border: '1px solid rgba(34,93,89,0.4)' }}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium" style={{ color: '#A8C5C3' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
