'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

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
          <Eyebrow color="var(--color-warn-deep)" className="mb-3">
            The Problem
          </Eyebrow>
          <h2 className="section-heading text-ink">
            Why is the CPM model failing brand marketers?
          </h2>
        </motion.div>

        {/* Two callout cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Card 1 — CPM */}
          <motion.div
            className="rounded-2xl p-6 bg-surface border border-line"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <p className="label-eyebrow mb-3 text-ink-subtle">
              CPM Performance
            </p>
            <p className="text-sm md:text-base leading-relaxed mb-5 text-ink-muted">
              You're paying for 1,000 impressions to reach maybe 3 people who care. ROAS is declining quarter over quarter — and you already know it.
            </p>
            {/* Declining line chart */}
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="cpm-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: 'var(--color-warn-deep)' }} stopOpacity="0.12" />
                  <stop offset="100%" style={{ stopColor: 'var(--color-warn-deep)' }} stopOpacity="0" />
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
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{
                  stroke: 'var(--color-warn-deep)',
                  ...(pathLen > 0 ? {
                    strokeDasharray: pathLen,
                    strokeDashoffset: inView ? 0 : pathLen,
                    transition: 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.5s',
                  } : {}),
                }}
              />
              {/* End dot */}
              <motion.circle
                cx={iToX(CPM_POINTS.length - 1)} cy={vToY(14)} r={5}
                style={{ fill: 'var(--color-warn-deep)' }}
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
            className="rounded-2xl p-6 bg-surface border border-line"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
            <p className="label-eyebrow mb-3 text-ink-subtle">
              Zero-Click Reality
            </p>
            <p className="text-sm md:text-base leading-relaxed mb-5 text-ink-muted">
              SEO drives clicks. Media AEO drives AI citations. The audiences you need now get answers without clicking — where is your brand?
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
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface border border-line"
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.7 + i * 0.1 }}
                >
                  <span className="text-xl font-black shrink-0" style={{ color: 'var(--color-warn)' }}>{item.stat}</span>
                  <span className="text-sm leading-relaxed text-ink-muted">{item.desc}</span>
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
            className="label-eyebrow mb-6 text-ink-subtle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The insight
          </motion.p>

          <motion.h3
            className="text-4xl md:text-6xl font-bold leading-tight relative text-ink"
            initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Where is your brand
            <span className="block" style={{ color: 'var(--color-warn-deep)' }}>when people ask AI?</span>
          </motion.h3>
        </div>
      </div>
    </section>
  )
}
