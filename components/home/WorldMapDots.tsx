'use client'

import { useEffect, useState } from 'react'

// City coordinates: [x, y] in 1000×500 equirectangular SVG space
// x = (lon + 180) / 360 * 1000,  y = (90 - lat) / 180 * 500
const CITIES = [
  { x: 186, y: 140 }, // New York
  { x: 148, y: 152 }, // Los Angeles
  { x: 490, y: 104 }, // London
  { x: 500, y: 112 }, // Paris
  { x: 514, y: 100 }, // Berlin
  { x: 617, y: 179 }, // Dubai
  { x: 668, y: 195 }, // Mumbai
  { x: 795, y: 158 }, // Shanghai
  { x: 784, y: 140 }, // Beijing
  { x: 850, y: 148 }, // Tokyo
  { x: 822, y: 140 }, // Seoul
  { x: 762, y: 242 }, // Singapore
  { x: 762, y: 258 }, // Jakarta
  { x: 278, y: 310 }, // São Paulo
  { x: 182, y: 194 }, // Mexico City
  { x: 548, y: 160 }, // Cairo
  { x: 880, y: 340 }, // Sydney
]

// Asia-Pacific cities (indices for higher frequency pings)
const APAC_INDICES = [7, 8, 9, 10, 11, 12, 16]

// Simplified land mass dots — pre-computed grid points that fall on land
// Using a coarse 80×40 grid approximation of world continents
function generateLandDots() {
  // Simplified continent masks as rectangles [x1,y1,x2,y2] in 0-1000 × 0-500
  const continents = [
    // North America
    [130,80,240,230],
    [150,100,200,260],
    // South America
    [220,260,310,440],
    [240,240,290,320],
    // Europe
    [460,80,560,160],
    [470,90,550,150],
    // Africa
    [460,160,570,390],
    [480,170,560,380],
    // Asia (mainland)
    [560,80,860,300],
    [600,90,850,280],
    [560,90,660,200],
    // Southeast Asia / Indonesia
    [700,220,880,310],
    [720,230,860,300],
    // Japan/Korea
    [820,120,870,190],
    // Australia
    [730,300,900,420],
    [750,310,890,410],
  ]
  const dots: { x: number; y: number }[] = []
  const step = 14
  for (let y = 30; y < 480; y += step) {
    for (let x = 30; x < 980; x += step) {
      const onLand = continents.some(([x1, y1, x2, y2]) =>
        x >= x1 && x <= x2 && y >= y1 && y <= y2
      )
      if (onLand) {
        // Add slight random offset for organic look
        const jx = (Math.sin(x * 0.37 + y * 0.19) * 3)
        const jy = (Math.cos(x * 0.23 + y * 0.41) * 3)
        dots.push({ x: x + jx, y: y + jy })
      }
    }
  }
  return dots
}

const LAND_DOTS = generateLandDots()

interface Ping {
  id: number
  x: number
  y: number
  topic: string
  value: string
  isStrong: boolean
}

const TOPICS = [
  { topic: 'Retirement planning', value: '$15.20', strong: true },
  { topic: 'ETF portfolio', value: '$12.30', strong: true },
  { topic: 'Health plan comparison', value: '$7.40', strong: false },
  { topic: 'Auto insurance', value: '$6.80', strong: false },
  { topic: 'Credit card rewards', value: '$5.90', strong: false },
  { topic: 'Life insurance quote', value: '$8.80', strong: true },
  { topic: 'Mortgage tracking', value: '$9.60', strong: false },
  { topic: 'College savings', value: '$14.50', strong: true },
  { topic: 'Term life quotes', value: '$8.20', strong: true },
  { topic: 'Index fund selection', value: '$12.80', strong: true },
  { topic: 'Critical illness', value: '$9.20', strong: false },
  { topic: 'Travel insurance', value: '$6.20', strong: false },
]

let pingCounter = 0

interface WorldMapDotsProps {
  variant?: 'dark' | 'light'
}

export function WorldMapDots({ variant = 'dark' }: WorldMapDotsProps) {
  const isLight = variant === 'light'
  const [pings, setPings] = useState<Ping[]>([])

  useEffect(() => {
    // Add a ping every 1.2–2.4s
    const addPing = () => {
      const isAPAC = Math.random() < 0.55
      const cityPool = isAPAC
        ? APAC_INDICES.map(i => CITIES[i])
        : CITIES
      const city = cityPool[Math.floor(Math.random() * cityPool.length)]
      const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
      const id = ++pingCounter
      setPings(prev => [...prev.slice(-12), {
        id,
        x: city.x + (Math.random() - 0.5) * 20,
        y: city.y + (Math.random() - 0.5) * 20,
        topic: topic.topic,
        value: topic.value,
        isStrong: topic.strong,
      }])
      // Remove after 3s
      setTimeout(() => setPings(prev => prev.filter(p => p.id !== id)), 3000)
    }

    const interval = setInterval(addPing, 1400 + Math.random() * 1000)
    addPing()

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        {/* Land dots */}
        {LAND_DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={1.4}
            fill={isLight ? 'rgba(34,93,89,0.14)' : 'rgba(34,93,89,0.55)'}
          />
        ))}

        {/* Animated pings */}
        {pings.map(ping => (
          <g key={ping.id}>
            {/* Outer ring */}
            <circle
              cx={ping.x}
              cy={ping.y}
              r={ping.isStrong ? 8 : 5}
              fill="none"
              stroke={ping.isStrong ? '#F59E0B' : '#225D59'}
              strokeWidth={1}
              className="ping-ring"
              style={{ transformOrigin: `${ping.x}px ${ping.y}px` }}
            />
            {/* Center dot */}
            <circle
              cx={ping.x}
              cy={ping.y}
              r={ping.isStrong ? 3 : 2}
              fill={ping.isStrong ? '#F59E0B' : '#2d7a74'}
            />
          </g>
        ))}
      </svg>


    </div>
  )
}
