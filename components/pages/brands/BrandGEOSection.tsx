'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Eyebrow } from '@/components/ui/Eyebrow'

const STEPS = [
  {
    num: '01',
    label: 'Brand onboarding',
    desc: 'Your products, claims and positioning ingested into Cortex.',
  },
  {
    num: '02',
    label: 'Reader moments captured',
    desc: 'Intent signals captured across the 15M+ MAU network.',
  },
  {
    num: '03',
    label: 'News matched to products',
    desc: 'Live content matched to relevant products in real time.',
  },
  {
    num: '04',
    label: 'AI Q&A generated',
    desc: 'Grounded answers generated that cite your brand in context.',
  },
  {
    num: '05',
    label: 'Organic exposure',
    desc: 'Buyers meet you mid-decision — and the lead is attributed.',
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
            className="label-eyebrow-md mb-8 text-primary"
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
              className="font-black tabular-nums leading-none text-white"
              style={{
                fontSize: 'clamp(2rem, 11vw, 9rem)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              {count.toLocaleString()}<span className="text-gold">+</span>
            </div>
          </motion.div>

          <motion.p
            className="text-base mt-4 text-gold"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Monthly Active Users across managed media and content properties.
          </motion.p>

          {/* Stat pills */}
          <motion.div
            className="flex flex-col sm:items-center lg:flex-row lg:flex-wrap lg:justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              { stat: '4.26%', desc: 'Q&A Widget CTR vs 0.1–0.5% for banner ads' },
              { stat: '16×',   desc: 'views per active reader per month' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3 rounded-xl w-full sm:w-[400px] lg:w-auto"
                style={{ background: 'rgba(168,197,195,0.07)', border: '1px solid rgba(168,197,195,0.12)' }}
              >
                <span className="text-xl font-black tabular-nums w-16 shrink-0 text-gold">{item.stat}</span>
                <span className="text-xs leading-snug text-left flex-1 text-on-dark/70">{item.desc}</span>
              </div>
            ))}
          </motion.div>
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
          className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-0 relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {/* Left — chart */}
          <div className="pt-8 pb-4 lg:border-r" style={{ borderColor: 'rgba(168,197,195,0.12)' }}>
            <svg viewBox={`0 0 ${SVG_W / 2} ${SVG_H}`} className="w-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="geo-mau-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
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
                fill="none" stroke="var(--color-gold)" strokeWidth="2.5"
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
                    fill="var(--color-gold)"
                    style={{ filter: 'drop-shadow(0 0 8px var(--color-gold))' }}
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
            <p className="text-base leading-relaxed mb-3 text-on-dark">
              Premium content platforms in finance, health, news, lifestyle, and technology — your buyers already read here.
            </p>
            <p className="text-base leading-relaxed text-on-dark">
              Every placement comes with first-party intent data — so you can see what readers asked, and prove it converted.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Thin divider ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6">
        <div style={{ height: 1, background: 'rgba(168,197,195,0.12)' }} />
      </div>

      {/* ── Media AEO workflow ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 relative z-10 pt-16 lg:pt-20 pb-20 lg:pb-28">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow className="mb-3 text-on-dark/55">
            Media AEO — Answer Engine Optimization
          </Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            How does managed media AEO differ from open-web AEO strategies?
          </h2>
          <p className="text-base max-w-xl text-on-dark">
            SEO drives clicks. Media AEO drives AI citations — your brand referenced when readers ask AI-powered questions in your vertical.
          </p>
        </motion.div>

        {/* Horizontal timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden sm:block absolute left-0 right-0 pointer-events-none"
            style={{ height: 1, top: '4px', background: 'rgba(168,197,195,0.15)' }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col pr-6 pb-8 sm:pb-0"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            >
              {/* Dot */}
              <div
                className="hidden sm:block w-[10px] h-[10px] rounded-full mb-4 relative z-10 shrink-0"
                style={{ background: 'var(--color-on-dark)', border: '2px solid rgba(168,197,195,0.4)' }}
              />
              {/* Number */}
              <span className="text-xs font-bold tabular-nums mb-2" style={{ color: 'rgba(168,197,195,0.45)' }}>{step.num}</span>
              {/* Title */}
              <p className="text-sm font-bold text-white mb-1 leading-snug">{step.label}</p>
              {/* Desc */}
              <p className="text-xs leading-relaxed text-on-dark/60">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
