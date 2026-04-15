'use client'

import { useEffect, useRef } from 'react'

const NODES = [
  { label: '15M+ MAU\nInstalled Base', sublabel: 'and growing', angle: -90 },
  { label: 'More intent\ndata', sublabel: 'data moat deepens', angle: -18 },
  { label: 'Smarter\ndecisions', sublabel: 'AI routing improves', angle: 54 },
  { label: 'Higher CPL\nfor brands', sublabel: 'brand revenue up', angle: 126 },
  { label: 'Higher publisher\nrevenue', sublabel: 'more owners join', angle: 198 },
]

const RADIUS = 130
const CX = 200
const CY = 200

function nodePos(angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return {
    x: CX + RADIUS * Math.cos(rad),
    y: CY + RADIUS * Math.sin(rad),
  }
}

export function FlywheelDiagram() {
  const ringRef = useRef<SVGCircleElement>(null)

  return (
    <div className="flex items-center justify-center py-4">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-sm lg:max-w-none"
        style={{ overflow: 'visible' }}
      >
        {/* Rotating outer ring */}
        <circle
          ref={ringRef}
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="none"
          stroke="rgba(34,93,89,0.3)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          style={{ animation: 'orbit-ring 18s linear infinite', transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Connection lines between nodes */}
        {NODES.map((_, i) => {
          const from = nodePos(NODES[i].angle)
          const to = nodePos(NODES[(i + 1) % NODES.length].angle)
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="rgba(34,93,89,0.2)"
              strokeWidth="1"
            />
          )
        })}

        {/* Center */}
        <circle cx={CX} cy={CY} r={52} fill="#1A3D3A" stroke="rgba(34,93,89,0.8)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={44} fill="rgba(34,93,89,0.4)" />
        <text x={CX} y={CY - 8} textAnchor="middle" fill="#FAFAFA" fontSize="9" fontWeight="700" letterSpacing="0.5">
          DECISION
        </text>
        <text x={CX} y={CY + 4} textAnchor="middle" fill="#FAFAFA" fontSize="9" fontWeight="700" letterSpacing="0.5">
          ENGINE
        </text>
        <text x={CX} y={CY + 18} textAnchor="middle" fill="#F59E0B" fontSize="7">
          per dollar ·
        </text>
        <text x={CX} y={CY + 28} textAnchor="middle" fill="#F59E0B" fontSize="7">
          intelligent outcome
        </text>

        {/* Nodes */}
        {NODES.map((node, i) => {
          const pos = nodePos(node.angle)
          const lines = node.label.split('\n')
          const isLeft = pos.x < CX - 20
          const isRight = pos.x > CX + 20
          const anchorX = isLeft ? pos.x - 14 : isRight ? pos.x + 14 : pos.x
          const anchor = isLeft ? 'end' : isRight ? 'start' : 'middle'

          return (
            <g key={i}>
              {/* Node circle */}
              <circle cx={pos.x} cy={pos.y} r={8} fill="#1A3D3A" stroke="#225D59" strokeWidth="2" />
              <circle cx={pos.x} cy={pos.y} r={3.5} fill="#F59E0B" />

              {/* Label */}
              <text x={anchorX} y={pos.y - 8} textAnchor={anchor} fill="#FAFAFA" fontSize="8.5" fontWeight="600">
                {lines[0]}
              </text>
              {lines[1] && (
                <text x={anchorX} y={pos.y + 2} textAnchor={anchor} fill="#FAFAFA" fontSize="8.5" fontWeight="600">
                  {lines[1]}
                </text>
              )}
              <text x={anchorX} y={pos.y + 14} textAnchor={anchor} fill="#A8C5C3" fontSize="7.5">
                {node.sublabel}
              </text>
            </g>
          )
        })}

        {/* Animated traveling dot on ring */}
        <circle r="4" fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 4px #F59E0B)' }}>
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            path={`M ${CX} ${CY - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 ${CX - 0.001} ${CY - RADIUS}`}
          />
        </circle>
      </svg>
    </div>
  )
}
