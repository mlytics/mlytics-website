'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

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
function iToX(i: number) {
  return PAD_L + (i / (DATA_POINTS.length - 1)) * (SVG_W - PAD_L - PAD_R)
}
function buildPath() {
  return DATA_POINTS.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${iToX(i).toFixed(1)} ${vToY(p.v).toFixed(1)}`
  ).join(' ')
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

export function BrandMAUSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const count = useCountUp(15_000_000, 2200, inView)

  const pathD = buildPath()
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLen, setPathLen] = useState(0)
  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength())
  }, [])

  return (
    <section className="section-dark py-20 lg:py-28 relative overflow-hidden" ref={ref}>
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(245,158,11,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">

        {/* Narrative bridge */}
        <motion.p
          className="text-sm font-semibold uppercase tracking-widest mb-8"
          style={{ color: 'rgba(168,197,195,0.5)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          Your audience didn't disappear.
        </motion.p>

        {/* Giant number */}
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
            {count.toLocaleString()}
            <span style={{ color: '#F59E0B' }}>+</span>
          </div>
        </motion.div>

        {/* Subline under number */}
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

      {/* Divider */}
      <motion.div
        className="max-w-4xl mx-auto px-6 mt-10 mb-0"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div style={{ height: 1, background: 'rgba(168,197,195,0.12)' }} />
      </motion.div>

      {/* Bottom: chart left + copy right */}
      <motion.div
        className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-0 relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        {/* Left — chart */}
        <div className="pt-8 pb-4 md:border-r" style={{ borderColor: 'rgba(168,197,195,0.12)' }}>
          <svg
            viewBox={`0 0 ${SVG_W / 2} ${SVG_H}`}
            className="w-full"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="mau-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
              <clipPath id="mau-clip">
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
              fill="url(#mau-fill)" clipPath="url(#mau-clip)"
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
                  transition={{ duration: 0.4, delay: 2.6 }}
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
          <p className="text-sm mt-4 leading-relaxed" style={{ color: 'rgba(168,197,195,0.55)' }}>
            They moved to AI experiences. We're already there. And if your target vertical isn't covered yet, Mlytics acquires the content owners to build it.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
