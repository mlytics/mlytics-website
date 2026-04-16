'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// CPM ROAS decline — normalised (100 = peak performance, declining right)
const CPM_POINTS = [
  { label: '2020', v: 92 },
  { label: '2021', v: 78 },
  { label: '2022', v: 61 },
  { label: '2023', v: 44 },
  { label: '2024', v: 29 },
  { label: 'Today', v: 14 },
]

const SVG_W = 340
const SVG_H = 120
const PAD_L = 8
const PAD_R = 8
const PAD_T = 12
const PAD_B = 28

function vToY(v: number) {
  return PAD_T + ((100 - v) / 100) * (SVG_H - PAD_T - PAD_B)
}
function iToX(i: number) {
  return PAD_L + (i / (CPM_POINTS.length - 1)) * (SVG_W - PAD_L - PAD_R)
}
function buildPath() {
  return CPM_POINTS.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${iToX(i).toFixed(1)} ${vToY(p.v).toFixed(1)}`
  ).join(' ')
}

export function BrandPainSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLen, setPathLen] = useState(0)
  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength())
  }, [])

  const pathD = buildPath()

  return (
    <section className="section-white py-16 lg:py-20" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#B45309' }}>
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#1A1A1A' }}>
            The CPM model is broken.<br />
            <span style={{ color: '#B45309' }}>And zero-click is making it worse.</span>
          </h2>
        </motion.div>

        {/* Two callout cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Card 1 — CPM */}
          <motion.div
            className="rounded-2xl p-6"
            style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#B45309' }}>
              CPM Performance
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B6B6B' }}>
              You're paying for 1,000 impressions to reach maybe 3 people who care. ROAS is declining quarter over quarter — and you already know it.
            </p>
            {/* Declining line chart */}
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="cpm-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B45309" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
                </linearGradient>
                <clipPath id="cpm-clip">
                  <motion.rect
                    x={PAD_L} y={0} height={SVG_H}
                    initial={{ width: 0 }}
                    animate={inView ? { width: SVG_W - PAD_L - PAD_R } : { width: 0 }}
                    transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </clipPath>
              </defs>
              {/* Grid */}
              {[30, 60, 90].map(v => (
                <line key={v} x1={PAD_L} y1={vToY(v)} x2={SVG_W - PAD_R} y2={vToY(v)}
                  stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
              ))}
              {/* Area */}
              <path
                d={`${pathD} L ${iToX(CPM_POINTS.length - 1).toFixed(1)} ${SVG_H - PAD_B} L ${PAD_L} ${SVG_H - PAD_B} Z`}
                fill="url(#cpm-fill)" clipPath="url(#cpm-clip)"
              />
              {/* Line */}
              <path
                ref={pathRef} d={pathD} fill="none"
                stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={pathLen > 0 ? {
                  strokeDasharray: pathLen,
                  strokeDashoffset: inView ? 0 : pathLen,
                  transition: 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.5s',
                } : {}}
              />
              {/* End dot */}
              <motion.circle
                cx={iToX(CPM_POINTS.length - 1)} cy={vToY(14)} r={5}
                fill="#B45309"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 2.0 }}
              />
              {/* X labels */}
              {CPM_POINTS.map((p, i) => (
                <text key={i} x={iToX(i)} y={SVG_H - 6} textAnchor="middle"
                  fill="rgba(107,107,107,0.5)" fontSize="10" fontWeight="500">{p.label}</text>
              ))}
              {/* Y label */}
              <text x={PAD_L} y={vToY(92) - 4} fill="rgba(107,107,107,0.5)" fontSize="10">ROAS</text>
            </svg>
          </motion.div>

          {/* Card 2 — Zero-click */}
          <motion.div
            className="rounded-2xl p-6"
            style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#B45309' }}>
              Zero-Click Reality
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B6B6B' }}>
              The audiences you need are increasingly consuming content through AI experiences — where traditional ads simply don't exist.
            </p>
            {/* Stat pills */}
            <div className="space-y-3">
              {[
                { stat: '60%+', desc: 'of searches end without a click' },
                { stat: '77%', desc: 'zero-click rate on mobile' },
                { stat: '85%', desc: 'zero-click with AI Overviews' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.12)' }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.7 + i * 0.1 }}
                >
                  <span className="text-xl font-black shrink-0" style={{ color: '#B45309' }}>{item.stat}</span>
                  <span className="text-xs leading-relaxed" style={{ color: '#6B6B6B' }}>{item.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Large conclusion callout — same pattern as AILayerSection */}
        <div className="mt-20 text-center relative">
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 60%, rgba(180,83,9,0.07) 0%, transparent 70%)' }}
          />

          {/* Thin separator */}
          <motion.div
            className="mx-auto mb-8"
            style={{ width: 40, height: 1, background: 'rgba(180,83,9,0.3)' }}
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          <motion.p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: '#9B9B9B' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The insight
          </motion.p>

          <motion.h3
            className="text-4xl md:text-6xl font-bold leading-tight relative"
            style={{ color: '#1A1A1A' }}
            initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            The problem isn't your budget.
            <span className="block" style={{ color: '#B45309' }}>It's your buying model.</span>
          </motion.h3>
        </div>
      </div>
    </section>
  )
}
