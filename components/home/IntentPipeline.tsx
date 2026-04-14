'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const LAYERS = [
  {
    icon: '🌐',
    name: 'Content Owner Traffic',
    sublabel: 'Raw attention',
    audience: 'Raw material',
    price: '400K–4M WAU',
    priceColor: '#A8C5C3',
    desc: 'Every page view across media platforms is raw intent signal — unrefined, unmonetized, waiting to be captured.',
    color: 'rgba(168,197,195,0.15)',
    borderColor: 'rgba(168,197,195,0.25)',
  },
  {
    icon: '⚡',
    name: 'Decisive Engine',
    sublabel: 'Route · Observe · Decide',
    audience: 'Developers / Tech',
    price: '$1,000/mo',
    priceColor: '#A8C5C3',
    desc: 'Content delivery in <50ms. Every request routed optimally, every decision feeding the intent system. 20% TCO reduction.',
    color: 'rgba(34,93,89,0.2)',
    borderColor: 'rgba(34,93,89,0.5)',
  },
  {
    icon: '✍️',
    name: 'AI Q&A Widget',
    sublabel: 'Capture weak intent',
    audience: 'Content Owners',
    price: '$5,000/mo',
    priceColor: '#F59E0B',
    desc: '$0.10/article vs $250 human cost. 2,500× productivity. Every article becomes an intent capture point.',
    color: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  {
    icon: '💬',
    name: 'Full Conversation',
    sublabel: 'Capture strong intent',
    audience: 'Content Owners + Brands',
    price: 'CPL billing',
    priceColor: '#F59E0B',
    desc: 'Readers move from browsing to decision. Strong intent captured, qualified, and matched to relevant brands.',
    color: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.4)',
  },
  {
    icon: '🎯',
    name: 'Lead Pilot',
    sublabel: 'Qualify · Deliver · Convert',
    audience: 'Brands',
    price: 'Performance billing',
    priceColor: '#F59E0B',
    desc: 'Verified strong intent, delivered CRM-ready. Replaces junior SDR workflow at a fraction of the cost.',
    color: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.5)',
  },
]

const CYCLE_INTERVAL = 3000
// Measured in-browser: all descriptions render at 71px at 512px container width
// Using 76px to add a small buffer for rounding/subpixel differences
const DESC_H = 76

export function IntentPipeline() {
  const [expanded, setExpanded] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setExpanded(prev => (prev + 1) % LAYERS.length)
    }, CYCLE_INTERVAL)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function handleClick(i: number) {
    setExpanded(i)
    startTimer()
  }

  return (
    <div className="relative max-w-lg mx-auto">
      {/* Vertical flow line */}
      <div
        className="absolute left-[28px] top-8 bottom-8 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, #225D59 10%, #F59E0B 90%, transparent)' }}
      />

      {/* Animated particle */}
      <div className="absolute left-[25px] top-0 bottom-0 overflow-hidden pointer-events-none">
        <div
          className="w-1.5 h-1.5 rounded-full absolute"
          style={{ background: '#F59E0B', animation: 'flow-particle 3s linear infinite', boxShadow: '0 0 6px #F59E0B' }}
        />
      </div>

      <div className="space-y-1">
        {LAYERS.map((layer, i) => {
          const isOpen = expanded === i
          return (
            <div key={i}>
              <motion.div
                onClick={() => handleClick(i)}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="relative flex items-start gap-4 pl-14 pr-4 py-3.5 rounded-xl cursor-pointer"
                style={{
                  background: isOpen ? layer.color : 'transparent',
                  border: `1px solid ${isOpen ? layer.borderColor : 'transparent'}`,
                  transition: 'background 0.35s ease-in-out, border-color 0.35s ease-in-out',
                }}
              >
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-base z-10"
                  style={{ background: '#1A3D3A', border: `2px solid ${layer.borderColor}` }}
                >
                  {layer.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{layer.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: '#A8C5C3' }}>
                      {layer.audience}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#A8C5C3' }}>{layer.sublabel}</p>
                </div>

                <span className="shrink-0 text-xs font-semibold" style={{ color: layer.priceColor }}>{layer.price}</span>
              </motion.div>

              {/*
                grid-template-rows: 0fr ↔ 1fr uses the actual content height as 1fr.
                Both closing and opening animate over the same real pixel height,
                so their sum is always constant → zero net layout shift.
              */}
              <div
                className="pl-14 pr-4"
                style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  opacity: isOpen ? 1 : 0,
                  transition: 'grid-template-rows 0.35s ease-in-out, opacity 0.25s ease-in-out',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <p className="text-xs py-2 leading-relaxed" style={{ color: 'rgba(168,197,195,0.85)' }}>
                    {layer.desc}
                  </p>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
