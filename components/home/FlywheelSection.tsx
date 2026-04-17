'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FlywheelDiagram } from './FlywheelDiagram'

function CountUp({ target, duration, active }: { target: number; duration: number; active: boolean }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return (
    <span>
      {value.toLocaleString()}<span style={{ color: '#F59E0B' }}>+</span>
    </span>
  )
}

export function FlywheelSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-dark py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: flywheel — contain layout+paint so SVG overflow:visible never shifts right column */}
          <div style={{ contain: 'layout paint' }}>
            <FlywheelDiagram />
          </div>

          {/* Right: copy */}
          <div ref={ref}>
            <motion.span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(168,197,195,0.55)' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              The Flywheel
            </motion.span>
            <motion.h2
              className="text-3xl md:text-4xl font-bold leading-tight mb-5"
              style={{ color: '#FAFAFA' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The longer it spins,<br />
              the harder it is to stop.
            </motion.h2>
            <motion.p
              className="text-base leading-relaxed mb-10"
              style={{ color: 'rgba(168,197,195,0.65)' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Every routing decision feeds the intelligence layer. The loop compounds with every request.
            </motion.p>

            {/* Large number callout */}
            <div className="relative">
              {/* Thin separator */}
              <motion.div
                className="mb-6"
                style={{ width: 40, height: 1, background: 'rgba(245,158,11,0.4)' }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={inView ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              />

              {/* Label above number */}
              <motion.p
                className="text-sm font-semibold mb-2"
                style={{ color: '#F59E0B' }}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                Monthly Active Users
              </motion.p>

              {/* Giant number */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <div
                  className="font-black tabular-nums leading-none"
                  style={{
                    fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                    letterSpacing: '-0.04em',
                    color: '#FAFAFA',
                    lineHeight: 1,
                  }}
                >
                  <CountUp target={15_000_000} duration={2200} active={inView} />
                </div>
              </motion.div>

              {/* Sub text */}
              <motion.p
                className="text-sm mt-4"
                style={{ color: 'rgba(168,197,195,0.65)' }}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Not a CDN vendor. A platform with distribution.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
