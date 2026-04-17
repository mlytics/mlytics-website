'use client'

import { motion } from 'framer-motion'

const NODES = [
  { label: '15M+ MAU',    sub: 'Installed Base',      angle: -90 },
  { label: 'More Intent', sub: 'data moat deepens',   angle: -18 },
  { label: 'Smarter AI',  sub: 'routing improves',    angle:  54 },
  { label: 'Higher CPL',  sub: 'brand revenue up',    angle: 126 },
  { label: 'More Owners', sub: 'publishers join',     angle: 198 },
]

const R = 148
const CX = 200
const CY = 210

function polar(angleDeg: number, r = R) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

const ringPath = `
  M ${CX} ${CY - R}
  A ${R} ${R} 0 1 1 ${CX - 0.001} ${CY - R}
`

export function FlywheelDiagram() {
  return (
    <div className="flex items-center justify-center py-2">
      <svg
        viewBox="0 0 400 420"
        className="w-full max-w-sm lg:max-w-none"
        style={{ overflow: 'visible' }}
      >
        {/* ── Orbit ring ── */}
        <motion.circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(34,93,89,0.22)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ animation: 'orbit-ring 22s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* ── Spoke lines ── */}
        {NODES.map((node, i) => {
          const p = polar(node.angle, R - 24)
          return (
            <motion.line
              key={i}
              x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke="rgba(34,93,89,0.14)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
            />
          )
        })}

        {/* ── Hub ── */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <circle cx={CX} cy={CY} r={58} fill="none" stroke="rgba(34,93,89,0.25)" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={50} fill="#1A3D3A" />
          <circle cx={CX} cy={CY} r={43} fill="rgba(34,93,89,0.5)" />
          <text x={CX} y={CY - 10} textAnchor="middle" fill="#FAFAFA" fontSize="8.5" fontWeight="700" letterSpacing="0.8">
            DECISION
          </text>
          <text x={CX} y={CY + 2} textAnchor="middle" fill="#FAFAFA" fontSize="8.5" fontWeight="700" letterSpacing="0.8">
            ENGINE
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fill="#F59E0B" fontSize="7.5" fontWeight="500">
            intent · route · earn
          </text>
        </motion.g>

        {/* ── Node circles — pass 1 (below particle) ── */}
        {NODES.map((node, i) => {
          const pos = polar(node.angle)
          return (
            <motion.g key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            >
              <circle cx={pos.x} cy={pos.y} r={18} fill="#1A3D3A" stroke="rgba(34,93,89,0.6)" strokeWidth="1.5" />
              <circle cx={pos.x} cy={pos.y} r={14} fill="rgba(34,93,89,0.35)" />
              <circle cx={pos.x} cy={pos.y} r={3}  fill="rgba(168,197,195,0.8)" />
            </motion.g>
          )
        })}

        {/* ── Travelling particle ── */}
        <circle r="5" fill="#F59E0B">
          <animateMotion dur="9s" repeatCount="indefinite" path={ringPath} />
        </circle>

        {/* ── Node labels — pass 2 (above particle) ── */}
        {NODES.map((node, i) => {
          const pos = polar(node.angle)
          const isLeft  = pos.x < CX - 20
          const isRight = pos.x > CX + 20
          const textX   = isLeft ? pos.x - 18 : isRight ? pos.x + 18 : pos.x
          const anchor  = isLeft ? 'end' : isRight ? 'start' : 'middle'
          return (
            <motion.g key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            >
              <text x={textX} y={pos.y - 22} textAnchor={anchor}
                fill="#FAFAFA" fontSize="9" fontWeight="700">
                {node.label}
              </text>
              <text x={textX} y={pos.y - 11} textAnchor={anchor}
                fill="rgba(168,197,195,0.65)" fontSize="7.5">
                {node.sub}
              </text>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
