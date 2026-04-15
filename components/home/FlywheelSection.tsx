'use client'

import { motion } from 'framer-motion'
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
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(168,197,195,0.55)' }}>
              The Flywheel
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5" style={{ color: '#FAFAFA' }}>
              The longer it spins,<br />
              the harder it is to stop.
            </h2>
            <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(168,197,195,0.65)' }}>
              Every routing decision feeds the intelligence layer. The loop compounds with every request.
            </p>

            {/* Emerging text callout */}
            <div className="text-left relative">
              {/* Background glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 80% 70% at 50% 60%, rgba(245,158,11,0.07) 0%, transparent 70%)',
                }}
              />

              {/* Thin separator */}
              <motion.div
                className="mb-6"
                style={{ width: 40, height: 1, background: 'rgba(245,158,11,0.4)' }}
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />

              <motion.p
                className="text-xs font-semibold uppercase tracking-widest mb-5 relative"
                style={{ color: 'rgba(168,197,195,0.6)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                15M+ Monthly Active Users
              </motion.p>

              <motion.h3
                className="text-3xl md:text-5xl font-bold leading-tight relative"
                style={{ color: '#FAFAFA' }}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                Not a CDN vendor.
                <span className="block" style={{ color: '#F59E0B' }}>A platform with distribution.</span>
              </motion.h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
