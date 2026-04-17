'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    label: 'Your brand content, indexed',
    desc: 'We ingest and structure your brand messaging, product pages, and editorial content into our AI knowledge layer.',
  },
  {
    num: '02',
    label: 'Mlytics GEO engine activates',
    desc: 'Our Generative Engine Optimization layer surfaces your brand as a relevant reference when readers ask AI-powered questions in your vertical — across all 15M+ MAU.',
  },
  {
    num: '03',
    label: 'You get the citations',
    desc: 'Your brand appears contextually inside AI answers readers trust — not as an ad, but as the right answer at the right moment. We do the work. You get the citations.',
  },
]

// ── MAU chart helpers ─────────────────────────────────────────────────────────
const DATA_POINTS = [
  { label: 'May 2025', v: 18 },
  { label: 'Jul 2025',  v: 38 },
  { label: 'Oct 2025',  v: 62 },
  { label: 'Jan 2026',  v: 82 },
  { label: 'Today',     v: 100 },
]

const SVG_W = 800
const SVG_H = 120
const PAD_L = 24
const PAD_R = 24
const PAD_T = 16
const PAD_B = 32

function vToY(v: number) {
  return PAD_T + ((100 - v) / 100) * (SVG_H - PAD_T - PAD_B)
}

function useCountUp(target: number, duration: number, active: boolean) {
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
  return value
}

export function BrandGEOSection() {
  const mauRef = useRef(null)
  const inView = useInView(mauRef, { once: true, margin: '-80px' })
  const count = useCountUp(15_000_000, 2200, inView)

  const pathRef = useRef<SVGPathElement>(null)
  const [pathLen, setPathLen] = useState(0)
  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength())
  }, [])

  return (
    <section className="section-dark relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 700px 400px at 60% 30%, rgba(34,93,89,0.08) 0%, transparent 70%)' }}
      />

      {/* ── MAU part ──────────────────────────────────────────────── */}
      <div className="relative z-10 pt-16 lg:pt-20 pb-16" ref={mauRef}>
        {/* Amber ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.p
            className="text-sm font-semibold uppercase tracking-widest mb-8"
            style={{ color: 'rgba(168,197,195,0.5)' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            Your audience didn't disappear.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              className="font-black tabular-nums leading-none"
              style={{
                fontSize: 'clamp(4rem, 14vw, 9rem)',
                letterSpacing: '-0.04em',
                color: '#FAFAFA',
                lineHeight: 1,
              }}
            >
              {count.toLocaleString()}<span style={{ color: '#F59E0B' }}>+</span>
            </div>
          </motion.div>

          <motion.p
            className="text-base mt-4"
            style={{ color: '#F59E0B' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Monthly Active Users — and counting.
          </motion.p>
        </div>

        {/* Inner divider */}
        <motion.div
          className="max-w-5xl mx-auto px-6 mt-10 mb-0"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div style={{ height: 1, background: 'rgba(168,197,195,0.12)' }} />
        </motion.div>

        {/* Chart + copy */}
        <motion.div
          className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-0 relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {/* Left — chart */}
          <div className="pt-8 pb-4 md:border-r" style={{ borderColor: 'rgba(168,197,195,0.12)' }}>
            <svg viewBox={`0 0 ${SVG_W / 2} ${SVG_H}`} className="w-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="geo-mau-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </linearGradient>
                <clipPath id="geo-mau-clip">
                  <motion.rect
                    x={PAD_L} y={0} height={SVG_H}
                    initial={{ width: 0 }}
                    animate={inView ? { width: SVG_W / 2 - PAD_L - PAD_R } : { width: 0 }}
                    transition={{ duration: 2.0, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </clipPath>
              </defs>

              {[33, 66].map(v => (
                <line key={v}
                  x1={PAD_L} y1={vToY(v)} x2={SVG_W / 2 - PAD_R} y2={vToY(v)}
                  stroke="rgba(168,197,195,0.06)" strokeWidth="1"
                />
              ))}

              <path
                d={DATA_POINTS.map((p, i) => {
                  const x = PAD_L + (i / (DATA_POINTS.length - 1)) * (SVG_W / 2 - PAD_L - PAD_R)
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${vToY(p.v).toFixed(1)}`
                }).join(' ') +
                  ` L ${(PAD_L + (SVG_W / 2 - PAD_L - PAD_R)).toFixed(1)} ${SVG_H - PAD_B} L ${PAD_L} ${SVG_H - PAD_B} Z`}
                fill="url(#geo-mau-fill)" clipPath="url(#geo-mau-clip)"
              />

              <path
                ref={pathRef}
                d={DATA_POINTS.map((p, i) => {
                  const x = PAD_L + (i / (DATA_POINTS.length - 1)) * (SVG_W / 2 - PAD_L - PAD_R)
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${vToY(p.v).toFixed(1)}`
                }).join(' ')}
                fill="none" stroke="#F59E0B" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={pathLen > 0 ? {
                  strokeDasharray: pathLen,
                  strokeDashoffset: inView ? 0 : pathLen,
                  transition: 'stroke-dashoffset 2.0s cubic-bezier(0.22,1,0.36,1) 0.7s',
                } : {}}
              />

              {(() => {
                const ex = PAD_L + (SVG_W / 2 - PAD_L - PAD_R)
                return (
                  <motion.circle
                    cx={ex} cy={vToY(100)} r={6}
                    fill="#F59E0B"
                    style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.25, delay: 2.45 }}
                  />
                )
              })()}

              {DATA_POINTS.map((p, i) => {
                const x = PAD_L + (i / (DATA_POINTS.length - 1)) * (SVG_W / 2 - PAD_L - PAD_R)
                return (
                  <text key={i} x={x} y={SVG_H - 6}
                    textAnchor={i === 0 ? 'start' : i === DATA_POINTS.length - 1 ? 'end' : 'middle'}
                    fill="rgba(168,197,195,0.35)" fontSize="11" fontWeight="500"
                  >
                    {p.label}
                  </text>
                )
              })}
            </svg>
          </div>

          {/* Right — copy */}
          <div className="pt-8 pb-4 md:pl-10 flex flex-col justify-center text-left">
            <p className="text-base leading-relaxed" style={{ color: '#A8C5C3' }}>
              Your audience is already part of our network — across 15M+ MAU on managed content properties in finance, health, lifestyle, news, and technology.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Thin divider ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6">
        <div style={{ height: 1, background: 'rgba(168,197,195,0.12)' }} />
      </div>

      {/* ── GEO part ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 relative z-10 pt-16 lg:pt-20 pb-20 lg:pb-28">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,197,195,0.55)' }}>
            GEO — Generative Engine Optimization
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Stop doing GEO yourself.<br />
            <span>We cover the entire network.</span>
          </h2>
          <p className="text-base max-w-xl" style={{ color: '#A8C5C3' }}>
            Mlytics handles GEO across our entire content owner network. Your brand appears as a relevant reference when readers ask AI-powered questions about your vertical.
          </p>
        </motion.div>

        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(168,197,195,0.15)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(34,93,89,0.15)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
            >
              <div
                className="px-5 py-3 border-b flex items-center justify-between"
                style={{ background: '#1f4f4b', borderColor: 'rgba(168,197,195,0.08)' }}
              >
                <span className="text-sm font-bold text-white">{step.label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: 'rgba(168,197,195,0.6)' }}>{step.num}</span>
              </div>
              <div className="px-5 py-4" style={{ background: 'rgba(34,93,89,0.25)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(168,197,195,0.9)' }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
